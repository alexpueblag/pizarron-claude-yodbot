const {defineConfig,devices}=require('@playwright/test');
module.exports=defineConfig({
 testDir:'./tests/browser',fullyParallel:false,workers:1,retries:0,timeout:30000,
 reporter:[['list'],['html',{outputFolder:'playwright-report',open:'never'}]],
 use:{baseURL:'http://127.0.0.1:4173',trace:'retain-on-failure',screenshot:'only-on-failure'},
 projects:[
  {name:'webkit-iphone',testMatch:['**/iphone.spec.cjs','**/alerts.spec.cjs','**/practice.spec.cjs','**/assist.spec.cjs'],use:{...devices['iPhone 13'],browserName:'webkit'}},
  {name:'chromium-offline',testMatch:'**/offline.spec.cjs',use:{...devices['Desktop Chrome'],browserName:'chromium'}}
 ],
 webServer:{command:'python3 -m http.server 4173 --bind 127.0.0.1',url:'http://127.0.0.1:4173',reuseExistingServer:!process.env.CI}
});
