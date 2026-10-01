import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch
import reviewer
import sys
import io
from reviewer import init_db, review, Unavailable, InvalidResult, valid_result, reason_for_http

RESULT={'summary':'Revisión sintética', 'decisions':['Definir plazo'], 'next_steps':['Revisar resultado'], 'evidence_gaps':[], 'requires_human':True}
class CoordinatorTests(unittest.TestCase):
 def setUp(self):
  self.tmp=tempfile.TemporaryDirectory();self.db=init_db(Path(self.tmp.name)/'state.db');self.calls=[]
 def tearDown(self):self.db.close();self.tmp.cleanup()
 def ok(self,name):
  def call(payload):self.calls.append(name);return dict(RESULT)
  return call
 def no(self,name,reason='quota_or_rate_limit'):
  def call(payload):self.calls.append(name);raise Unavailable(reason)
  return call
 def test_quota_falls_back_same_snapshot(self):
  r=review(self.db,{'id':'cut-1'}, {'claude':self.no('claude'),'openai':self.ok('openai')})
  self.assertEqual(r['provider'],'openai');self.assertEqual(self.calls,['claude','openai'])
 def test_success_does_not_call_other(self):
  review(self.db,{'id':'cut-1'},{'claude':self.ok('claude'),'openai':self.ok('openai')});self.assertEqual(self.calls,['claude'])
 def test_rotation_after_success(self):
  p={'claude':self.ok('claude'),'openai':self.ok('openai')}
  review(self.db,{'id':'a'},p);review(self.db,{'id':'b'},p);self.assertEqual(self.calls,['claude','openai'])
 def test_retry_does_not_repeat_completed_review(self):
  p={'claude':self.ok('claude'),'openai':self.ok('openai')};review(self.db,{'id':'a'},p)
  self.assertTrue(review(self.db,{'id':'a'},p)['cached']);self.assertEqual(len(self.calls),1)
 def test_both_unavailable_remain_pending_and_recover(self):
  p={'claude':self.no('claude'),'openai':self.no('openai')}
  self.assertEqual(review(self.db,{'id':'a'},p)['status'],'pending')
  self.assertEqual(review(self.db,{'id':'a'},{'claude':self.ok('claude'),'openai':self.ok('openai')})['status'],'reviewed')
 def test_changed_snapshot_is_not_silently_overwritten(self):
  p={'claude':self.ok('claude'),'openai':self.ok('openai')};review(self.db,{'id':'a','version':1},p)
  with self.assertRaises(ValueError):review(self.db,{'id':'a','version':2},p)
 def test_invalid_review_falls_back(self):
  r=review(self.db,{'id':'a'},{'claude':lambda p:{'summary':'only'},'openai':self.ok('openai')})
  self.assertEqual(r['provider'],'openai')
 def test_pending_does_not_consume_rotation(self):
  review(self.db,{'id':'a'},{'claude':self.no('c'),'openai':self.no('o')})
  self.assertEqual(self.db.execute('SELECT value FROM rotation').fetchone()[0],0)
 def test_classifies_errors_without_body(self):
  self.assertEqual(reason_for_http(429),'quota_or_rate_limit');self.assertEqual(reason_for_http(401),'authentication')
  self.assertEqual(reason_for_http(503),'provider_unavailable')
 def test_opaque_id_required(self):
  with self.assertRaises(ValueError):review(self.db,{'id':'../private'})
 def test_false_requires_human_valid_and_string_rejected(self):
  self.assertEqual(valid_result(dict(RESULT,requires_human=False))['requires_human'],False)
  with self.assertRaises(InvalidResult):valid_result(dict(RESULT,requires_human='false'))
 def test_result_is_durable_after_reopen(self):
  review(self.db,{'id':'a'},{'claude':self.ok('claude'),'openai':self.ok('openai')});self.db.close()
  self.db=init_db(Path(self.tmp.name)/'state.db')
  self.assertTrue(review(self.db,{'id':'a'})['cached'])
class InboxTests(unittest.TestCase):
 def test_finished_items_do_not_starve_queue_and_excess_is_reported(self):
  with tempfile.TemporaryDirectory() as tmp:
   inbox=Path(tmp)/'inbox';inbox.mkdir();database=Path(tmp)/'db.sqlite'
   db=init_db(database);providers={'claude':lambda p:dict(RESULT),'openai':lambda p:dict(RESULT)}
   for i in range(7):
    payload={'id':f'item-{i}'};(inbox/f'{i}.json').write_text(json.dumps(payload))
    if i==0:review(db,payload,providers)
   db.close();out=io.StringIO()
   with patch.object(sys,'argv',['reviewer','--inbox',str(inbox),'--db',str(database)]),patch.object(reviewer,'PROVIDERS',providers),patch('sys.stdout',out):
    self.assertEqual(reviewer.main(),1)
   counts=json.loads(out.getvalue())['counts'];self.assertEqual(counts['reviewed'],6);self.assertEqual(counts['deferred'],1)
   self.assertNotIn('item-',out.getvalue())
   db=init_db(database);self.assertEqual(db.execute("SELECT count(*) FROM reviews WHERE status='reviewed'").fetchone()[0],6);db.close()
if __name__=='__main__':unittest.main()
