/* Original instructional positions, validated with Ajedrex rules and detectors. */
const PRACTICE_LESSONS=[
 {
  "id": "attacked",
  "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  "setup": [
   "e4",
   "d5"
  ],
  "startFen": "rnbqkbnr/ppp1pppp/8/3p4/4P3/8/PPPP1PPP/RNBQKBNR w KQkq d6 0 2",
  "task": "spot",
  "prompt": "Toca una pieza que está atacada.",
  "explanation": "peón en d5 bajo ataque de e4. Hay apoyo geométrico en d8. Comprueba si puede recapturar legalmente. Estar atacada no significa estar perdida.",
  "confidence": "pattern",
  "observations": [
   {
    "squares": [
     "d5",
     "e4"
    ],
    "message": "peón en d5 bajo ataque de e4. Hay apoyo geométrico en d8. Comprueba si puede recapturar legalmente. Estar atacada no significa estar perdida.",
    "lines": [
     [
      "e4",
      "d5"
     ]
    ]
   },
   {
    "squares": [
     "e4",
     "d5"
    ],
    "message": "peón en e4 bajo ataque de d5. No hay defensores geométricos. Estar atacada no significa estar perdida.",
    "lines": [
     [
      "d5",
      "e4"
     ]
    ]
   }
  ],
  "solutions": [],
  "lines": [
   [
    "e4",
    "d5"
   ]
  ],
  "targets": [
   "d5",
   "e4"
  ]
 },
 {
  "id": "defended",
  "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  "setup": [],
  "startFen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  "task": "spot",
  "prompt": "Toca una pieza defendida.",
  "explanation": "caballo en b8 apoyado por a8. Una clavada puede impedir una recaptura.",
  "confidence": "pattern",
  "observations": [
   {
    "squares": [
     "b8",
     "a8"
    ],
    "message": "caballo en b8 apoyado por a8. Una clavada puede impedir una recaptura.",
    "lines": [
     [
      "a8",
      "b8"
     ]
    ]
   },
   {
    "squares": [
     "c8",
     "d8"
    ],
    "message": "alfil en c8 apoyado por d8. Una clavada puede impedir una recaptura.",
    "lines": [
     [
      "d8",
      "c8"
     ]
    ]
   },
   {
    "squares": [
     "d8",
     "e8"
    ],
    "message": "dama en d8 apoyado por e8. Una clavada puede impedir una recaptura.",
    "lines": [
     [
      "e8",
      "d8"
     ]
    ]
   },
   {
    "squares": [
     "f8",
     "e8"
    ],
    "message": "alfil en f8 apoyado por e8. Una clavada puede impedir una recaptura.",
    "lines": [
     [
      "e8",
      "f8"
     ]
    ]
   },
   {
    "squares": [
     "g8",
     "h8"
    ],
    "message": "caballo en g8 apoyado por h8. Una clavada puede impedir una recaptura.",
    "lines": [
     [
      "h8",
      "g8"
     ]
    ]
   },
   {
    "squares": [
     "a7",
     "a8"
    ],
    "message": "peón en a7 apoyado por a8. Una clavada puede impedir una recaptura.",
    "lines": [
     [
      "a8",
      "a7"
     ]
    ]
   },
   {
    "squares": [
     "b7",
     "c8"
    ],
    "message": "peón en b7 apoyado por c8. Una clavada puede impedir una recaptura.",
    "lines": [
     [
      "c8",
      "b7"
     ]
    ]
   },
   {
    "squares": [
     "c7",
     "d8"
    ],
    "message": "peón en c7 apoyado por d8. Una clavada puede impedir una recaptura.",
    "lines": [
     [
      "d8",
      "c7"
     ]
    ]
   },
   {
    "squares": [
     "d7",
     "b8",
     "c8",
     "d8",
     "e8"
    ],
    "message": "peón en d7 apoyado por b8, c8, d8, e8. Una clavada puede impedir una recaptura.",
    "lines": [
     [
      "b8",
      "d7"
     ],
     [
      "c8",
      "d7"
     ],
     [
      "d8",
      "d7"
     ],
     [
      "e8",
      "d7"
     ]
    ]
   },
   {
    "squares": [
     "e7",
     "d8",
     "e8",
     "f8",
     "g8"
    ],
    "message": "peón en e7 apoyado por d8, e8, f8, g8. Una clavada puede impedir una recaptura.",
    "lines": [
     [
      "d8",
      "e7"
     ],
     [
      "e8",
      "e7"
     ],
     [
      "f8",
      "e7"
     ],
     [
      "g8",
      "e7"
     ]
    ]
   },
   {
    "squares": [
     "f7",
     "e8"
    ],
    "message": "peón en f7 apoyado por e8. Una clavada puede impedir una recaptura.",
    "lines": [
     [
      "e8",
      "f7"
     ]
    ]
   },
   {
    "squares": [
     "g7",
     "f8"
    ],
    "message": "peón en g7 apoyado por f8. Una clavada puede impedir una recaptura.",
    "lines": [
     [
      "f8",
      "g7"
     ]
    ]
   },
   {
    "squares": [
     "h7",
     "h8"
    ],
    "message": "peón en h7 apoyado por h8. Una clavada puede impedir una recaptura.",
    "lines": [
     [
      "h8",
      "h7"
     ]
    ]
   },
   {
    "squares": [
     "a2",
     "a1"
    ],
    "message": "peón en a2 apoyado por a1. Una clavada puede impedir una recaptura.",
    "lines": [
     [
      "a1",
      "a2"
     ]
    ]
   },
   {
    "squares": [
     "b2",
     "c1"
    ],
    "message": "peón en b2 apoyado por c1. Una clavada puede impedir una recaptura.",
    "lines": [
     [
      "c1",
      "b2"
     ]
    ]
   },
   {
    "squares": [
     "c2",
     "d1"
    ],
    "message": "peón en c2 apoyado por d1. Una clavada puede impedir una recaptura.",
    "lines": [
     [
      "d1",
      "c2"
     ]
    ]
   },
   {
    "squares": [
     "d2",
     "b1",
     "c1",
     "d1",
     "e1"
    ],
    "message": "peón en d2 apoyado por b1, c1, d1, e1. Una clavada puede impedir una recaptura.",
    "lines": [
     [
      "b1",
      "d2"
     ],
     [
      "c1",
      "d2"
     ],
     [
      "d1",
      "d2"
     ],
     [
      "e1",
      "d2"
     ]
    ]
   },
   {
    "squares": [
     "e2",
     "d1",
     "e1",
     "f1",
     "g1"
    ],
    "message": "peón en e2 apoyado por d1, e1, f1, g1. Una clavada puede impedir una recaptura.",
    "lines": [
     [
      "d1",
      "e2"
     ],
     [
      "e1",
      "e2"
     ],
     [
      "f1",
      "e2"
     ],
     [
      "g1",
      "e2"
     ]
    ]
   },
   {
    "squares": [
     "f2",
     "e1"
    ],
    "message": "peón en f2 apoyado por e1. Una clavada puede impedir una recaptura.",
    "lines": [
     [
      "e1",
      "f2"
     ]
    ]
   },
   {
    "squares": [
     "g2",
     "f1"
    ],
    "message": "peón en g2 apoyado por f1. Una clavada puede impedir una recaptura.",
    "lines": [
     [
      "f1",
      "g2"
     ]
    ]
   },
   {
    "squares": [
     "h2",
     "h1"
    ],
    "message": "peón en h2 apoyado por h1. Una clavada puede impedir una recaptura.",
    "lines": [
     [
      "h1",
      "h2"
     ]
    ]
   },
   {
    "squares": [
     "b1",
     "a1"
    ],
    "message": "caballo en b1 apoyado por a1. Una clavada puede impedir una recaptura.",
    "lines": [
     [
      "a1",
      "b1"
     ]
    ]
   },
   {
    "squares": [
     "c1",
     "d1"
    ],
    "message": "alfil en c1 apoyado por d1. Una clavada puede impedir una recaptura.",
    "lines": [
     [
      "d1",
      "c1"
     ]
    ]
   },
   {
    "squares": [
     "d1",
     "e1"
    ],
    "message": "dama en d1 apoyado por e1. Una clavada puede impedir una recaptura.",
    "lines": [
     [
      "e1",
      "d1"
     ]
    ]
   },
   {
    "squares": [
     "f1",
     "e1"
    ],
    "message": "alfil en f1 apoyado por e1. Una clavada puede impedir una recaptura.",
    "lines": [
     [
      "e1",
      "f1"
     ]
    ]
   },
   {
    "squares": [
     "g1",
     "h1"
    ],
    "message": "caballo en g1 apoyado por h1. Una clavada puede impedir una recaptura.",
    "lines": [
     [
      "h1",
      "g1"
     ]
    ]
   }
  ],
  "solutions": [],
  "lines": [
   [
    "a8",
    "b8"
   ]
  ],
  "targets": [
   "b8",
   "c8",
   "d8",
   "f8",
   "g8",
   "a7",
   "b7",
   "c7",
   "d7",
   "e7",
   "f7",
   "g7",
   "h7",
   "a2",
   "b2",
   "c2",
   "d2",
   "e2",
   "f2",
   "g2",
   "h2",
   "b1",
   "c1",
   "d1",
   "f1",
   "g1"
  ]
 },
 {
  "id": "undefended",
  "fen": "7k/8/8/8/8/8/P7/R6K w - - 0 1",
  "setup": [],
  "startFen": "7k/8/8/8/8/8/P7/R6K w - - 0 1",
  "task": "spot",
  "prompt": "Toca una pieza sin apoyo.",
  "explanation": "torre en a1 sin defensa geométrica. Ahora mismo no está atacado.",
  "confidence": "pattern",
  "observations": [
   {
    "squares": [
     "a1"
    ],
    "message": "torre en a1 sin defensa geométrica. Ahora mismo no está atacado.",
    "lines": []
   }
  ],
  "solutions": [],
  "lines": [],
  "targets": [
   "a1"
  ]
 },
 {
  "id": "insufficientDefense",
  "fen": "7k/8/4p3/3r4/2P5/8/8/7K w - - 0 1",
  "setup": [],
  "startFen": "7k/8/4p3/3r4/2P5/8/8/7K w - - 0 1",
  "task": "play",
  "prompt": "Prueba una jugada que muestre defensa insuficiente.",
  "explanation": "cxd5: saldo local de +4 peones al comprobar las capturas y recapturas legales sobre d5. El apoyo no basta en ese intercambio. No incluye amenazas intermedias en otras casillas.",
  "confidence": "verified",
  "observations": [],
  "solutions": [
   [
    "c4d5"
   ]
  ],
  "lines": [
   [
    "c4",
    "d5"
   ]
  ],
  "targets": [
   "d5"
  ],
  "solutionNotes": {
   "c4d5": "cxd5: saldo local de +4 peones al comprobar las capturas y recapturas legales sobre d5. El apoyo no basta en ese intercambio. No incluye amenazas intermedias en otras casillas."
  }
 },
 {
  "id": "check",
  "fen": "4k3/8/8/8/8/8/8/K3R3 b - - 0 1",
  "setup": [],
  "startFen": "4k3/8/8/8/8/8/8/K3R3 b - - 0 1",
  "task": "spot",
  "prompt": "Toca el rey que está en jaque.",
  "explanation": "El rey en e8 está en jaque.",
  "confidence": "verified",
  "observations": [
   {
    "squares": [
     "e8",
     "e1"
    ],
    "message": "El rey en e8 está en jaque.",
    "lines": [
     [
      "e1",
      "e8"
     ]
    ]
   }
  ],
  "solutions": [],
  "lines": [
   [
    "e1",
    "e8"
   ]
  ],
  "targets": [
   "e8"
  ]
 },
 {
  "id": "overload",
  "fen": "3r2n1/8/7k/3n4/8/8/8/K2R2R1 w - - 0 1",
  "setup": [],
  "startFen": "3r2n1/8/7k/3n4/8/8/8/K2R2R1 w - - 0 1",
  "task": "play",
  "prompt": "Prueba una jugada que muestre sobrecarga.",
  "explanation": "Posible sobrecarga: d8 defiende g8 y d5. Tras Rxg8 Rxg8 queda una captura legal en d5. El rival puede elegir otra respuesta.",
  "confidence": "candidate",
  "observations": [],
  "solutions": [
   [
    "g1g8",
    "d8g8"
   ],
   [
    "d1d5",
    "d8d5"
   ]
  ],
  "lines": [
   [
    "d8",
    "g8"
   ],
   [
    "d8",
    "d5"
   ]
  ],
  "targets": [
   "d8"
  ],
  "solutionNotes": {
   "g1g8 d8g8": "Posible sobrecarga: d8 defiende g8 y d5. Tras Rxg8 Rxg8 queda una captura legal en d5. El rival puede elegir otra respuesta.",
   "d1d5 d8d5": "Posible sobrecarga: d8 defiende d5 y g8. Tras Rxd5 Rxd5 queda una captura legal en g8. El rival puede elegir otra respuesta."
  }
 },
 {
  "id": "advancedPawn",
  "fen": "7k/P7/8/8/8/8/8/6K1 w - - 0 1",
  "setup": [],
  "startFen": "7k/P7/8/8/8/8/8/6K1 w - - 0 1",
  "task": "spot",
  "prompt": "Toca un peón cerca de coronar.",
  "explanation": "Peón avanzado en a7. Comprueba si puedes apoyar su coronación.",
  "confidence": "pattern",
  "observations": [
   {
    "squares": [
     "a7"
    ],
    "message": "Peón avanzado en a7. Comprueba si puedes apoyar su coronación.",
    "lines": []
   }
  ],
  "solutions": [],
  "lines": [],
  "targets": [
   "a7"
  ]
 },
 {
  "id": "anastasiaMate",
  "fen": "8/4N1pk/8/8/8/8/8/KR6 w - - 0 1",
  "setup": [],
  "startFen": "8/4N1pk/8/8/8/8/8/KR6 w - - 0 1",
  "task": "play",
  "prompt": "Encuentra el mate de Anastasia.",
  "explanation": "Con Rh1#: Mate de Anastasia. El caballo cierra las diagonales interiores, una pieza propia bloquea la salida central y el jaque recorre el borde. Jaque mate comprobado por las reglas.",
  "confidence": "verified",
  "observations": [],
  "solutions": [
   [
    "b1h1"
   ]
  ],
  "lines": [],
  "targets": [
   "h7"
  ],
  "solutionNotes": {
   "b1h1": "Con Rh1#: Mate de Anastasia. El caballo cierra las diagonales interiores, una pieza propia bloquea la salida central y el jaque recorre el borde. Jaque mate comprobado por las reglas."
  }
 },
 {
  "id": "arabianMate",
  "fen": "7k/R7/5N2/8/8/8/8/K7 w - - 0 1",
  "setup": [],
  "startFen": "7k/R7/5N2/8/8/8/8/K7 w - - 0 1",
  "task": "play",
  "prompt": "Encuentra el mate de árabe.",
  "explanation": "Con Rh7#: Mate árabe. El caballo protege la torre adyacente y cierra la otra salida junto a la esquina. Jaque mate comprobado por las reglas.",
  "confidence": "verified",
  "observations": [],
  "solutions": [
   [
    "a7h7"
   ]
  ],
  "lines": [],
  "targets": [
   "h8"
  ],
  "solutionNotes": {
   "a7h7": "Con Rh7#: Mate árabe. El caballo protege la torre adyacente y cierra la otra salida junto a la esquina. Jaque mate comprobado por las reglas."
  }
 },
 {
  "id": "attackingF2F7",
  "fen": "6k1/8/8/2b5/7q/8/5PPP/6K1 w - - 0 1",
  "setup": [],
  "startFen": "6k1/8/8/2b5/7q/8/5PPP/6K1 w - - 0 1",
  "task": "spot",
  "prompt": "Toca el peón de f2 o f7 bajo presión.",
  "explanation": "Presión sobre el peón de f2 desde c5, h4. Es un ataque geométrico; una clavada puede impedir capturarlo.",
  "confidence": "pattern",
  "observations": [
   {
    "squares": [
     "f2",
     "c5",
     "h4"
    ],
    "message": "Presión sobre el peón de f2 desde c5, h4. Es un ataque geométrico; una clavada puede impedir capturarlo.",
    "lines": [
     [
      "c5",
      "f2"
     ],
     [
      "h4",
      "f2"
     ]
    ]
   }
  ],
  "solutions": [],
  "lines": [
   [
    "c5",
    "f2"
   ],
   [
    "h4",
    "f2"
   ]
  ],
  "targets": [
   "f2"
  ]
 },
 {
  "id": "attraction",
  "fen": "2r4k/8/8/2p3q1/8/6N1/8/K1R5 w - - 0 1",
  "setup": [],
  "startFen": "2r4k/8/8/2p3q1/8/6N1/8/K1R5 w - - 0 1",
  "task": "play",
  "prompt": "Prueba una jugada que muestre atracción.",
  "explanation": "Nf5 ofrece atraer la pieza de g5 a f5. Si responde Qxf5, Rxc5 crea un ataque doble que incluye esa pieza. La aceptación no es obligatoria.",
  "confidence": "candidate",
  "observations": [],
  "solutions": [
   [
    "g3f5",
    "g5f5",
    "c1c5"
   ],
   [
    "g3h5",
    "g5h5",
    "c1c5"
   ],
   [
    "c1c5",
    "c8c5",
    "g3e4"
   ]
  ],
  "lines": [
   [
    "g5",
    "f5"
   ],
   [
    "c1",
    "c5"
   ]
  ],
  "targets": [
   "f5",
   "h5",
   "c5"
  ],
  "solutionNotes": {
   "g3f5 g5f5 c1c5": "Nf5 ofrece atraer la pieza de g5 a f5. Si responde Qxf5, Rxc5 crea un ataque doble que incluye esa pieza. La aceptación no es obligatoria.",
   "g3h5 g5h5 c1c5": "Nh5 ofrece atraer la pieza de g5 a h5. Si responde Qxh5, Rxc5 crea un ataque doble que incluye esa pieza. La aceptación no es obligatoria.",
   "c1c5 c8c5 g3e4": "Rxc5 ofrece atraer la pieza de c8 a c5. Si responde Rxc5, Ne4 crea un ataque doble que incluye esa pieza. La aceptación no es obligatoria."
  }
 },
 {
  "id": "backRankMate",
  "fen": "6k1/5ppp/8/8/8/8/R7/K7 w - - 0 1",
  "setup": [],
  "startFen": "6k1/5ppp/8/8/8/8/R7/K7 w - - 0 1",
  "task": "play",
  "prompt": "Encuentra el mate de pasillo.",
  "explanation": "Con Ra8#: Mate del pasillo. Las piezas propias cierran todas las salidas hacia delante. Jaque mate comprobado por las reglas.",
  "confidence": "verified",
  "observations": [],
  "solutions": [
   [
    "a2a8"
   ]
  ],
  "lines": [],
  "targets": [
   "g8"
  ],
  "solutionNotes": {
   "a2a8": "Con Ra8#: Mate del pasillo. Las piezas propias cierran todas las salidas hacia delante. Jaque mate comprobado por las reglas."
  }
 },
 {
  "id": "balestraMate",
  "fen": "7k/5Q2/8/8/8/8/8/K3B3 w - - 0 1",
  "setup": [],
  "startFen": "7k/5Q2/8/8/8/8/8/K3B3 w - - 0 1",
  "task": "play",
  "prompt": "Encuentra el mate de Balestra.",
  "explanation": "Con Bc3#: Mate Balestra. El alfil da el jaque y la dama, situada a un salto de caballo, cubre las demás salidas. Jaque mate comprobado por las reglas.",
  "confidence": "verified",
  "observations": [],
  "solutions": [
   [
    "e1c3"
   ]
  ],
  "lines": [],
  "targets": [
   "h8"
  ],
  "solutionNotes": {
   "e1c3": "Con Bc3#: Mate Balestra. El alfil da el jaque y la dama, situada a un salto de caballo, cubre las demás salidas. Jaque mate comprobado por las reglas."
  }
 },
 {
  "id": "blindSwineMate",
  "fen": "7k/6Rp/8/8/8/8/8/K6R w - - 0 1",
  "setup": [],
  "startFen": "7k/6Rp/8/8/8/8/8/K6R w - - 0 1",
  "task": "play",
  "prompt": "Encuentra el mate de los cerdos ciegos.",
  "explanation": "Con Rhxh7#: Mate de los cerdos ciegos. Las dos torres contiguas se apoyan y forman un cerco de dos por dos casillas. Jaque mate comprobado por las reglas.",
  "confidence": "verified",
  "observations": [],
  "solutions": [
   [
    "h1h7"
   ]
  ],
  "lines": [],
  "targets": [
   "h8"
  ],
  "solutionNotes": {
   "h1h7": "Con Rhxh7#: Mate de los cerdos ciegos. Las dos torres contiguas se apoyan y forman un cerco de dos por dos casillas. Jaque mate comprobado por las reglas."
  }
 },
 {
  "id": "bodenMate",
  "fen": "2kr4/3p4/8/8/5B2/8/8/K4B2 w - - 0 1",
  "setup": [],
  "startFen": "2kr4/3p4/8/8/5B2/8/8/K4B2 w - - 0 1",
  "task": "play",
  "prompt": "Encuentra el mate de Boden.",
  "explanation": "Con Ba6#: Mate de Boden. Los alfiles cierran las salidas desde lados opuestos, con diagonales cruzadas. Jaque mate comprobado por las reglas.",
  "confidence": "verified",
  "observations": [],
  "solutions": [
   [
    "f1a6"
   ]
  ],
  "lines": [],
  "targets": [
   "c8"
  ],
  "solutionNotes": {
   "f1a6": "Con Ba6#: Mate de Boden. Los alfiles cierran las salidas desde lados opuestos, con diagonales cruzadas. Jaque mate comprobado por las reglas."
  }
 },
 {
  "id": "castling",
  "fen": "r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1",
  "setup": [],
  "startFen": "r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1",
  "task": "play",
  "prompt": "Realiza uno de los enroques legales.",
  "explanation": "Enroque legal disponible: O-O.",
  "confidence": "verified",
  "observations": [],
  "solutions": [
   [
    "e1g1"
   ],
   [
    "e1c1"
   ]
  ],
  "lines": [
   [
    "e1",
    "g1"
   ]
  ],
  "targets": [
   "e1"
  ],
  "solutionNotes": {
   "e1g1": "Enroque legal disponible: O-O.",
   "e1c1": "Enroque legal disponible: O-O-O."
  }
 },
 {
  "id": "enPassant",
  "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  "setup": [
   "e4",
   "a6",
   "e5",
   "d5"
  ],
  "startFen": "rnbqkbnr/1pp1pppp/p7/3pP3/8/8/PPPP1PPP/RNBQKBNR w KQkq d6 0 3",
  "task": "play",
  "prompt": "Prueba una jugada que muestre captura al paso.",
  "explanation": "Captura al paso disponible: exd6. Solo puedes hacerla en este turno.",
  "confidence": "verified",
  "observations": [],
  "solutions": [
   [
    "e5d6"
   ]
  ],
  "lines": [
   [
    "e5",
    "d6"
   ]
  ],
  "targets": [
   "e5"
  ],
  "solutionNotes": {
   "e5d6": "Captura al paso disponible: exd6. Solo puedes hacerla en este turno."
  }
 },
 {
  "id": "capturingDefender",
  "fen": "7k/8/5q2/3n4/8/8/6B1/5R1K w - - 0 1",
  "setup": [],
  "startFen": "7k/8/5q2/3n4/8/8/6B1/5R1K w - - 0 1",
  "task": "play",
  "prompt": "Prueba una jugada que muestre eliminar al defensor.",
  "explanation": "Bxd5 captura un defensor geométrico de f6. Se reduce su apoyo; todavía hay que comprobar la respuesta rival.",
  "confidence": "pattern",
  "observations": [],
  "solutions": [
   [
    "g2d5"
   ]
  ],
  "lines": [
   [
    "g2",
    "d5"
   ],
   [
    "d5",
    "f6"
   ]
  ],
  "targets": [
   "d5"
  ],
  "solutionNotes": {
   "g2d5": "Bxd5 captura un defensor geométrico de f6. Se reduce su apoyo; todavía hay que comprobar la respuesta rival."
  }
 },
 {
  "id": "collinearMove",
  "fen": "3r2k1/7p/8/8/8/8/8/3R2K1 w - - 0 1",
  "setup": [],
  "startFen": "3r2k1/7p/8/8/8/8/8/3R2K1 w - - 0 1",
  "task": "play",
  "prompt": "Prueba una jugada que muestre movimiento colineal.",
  "explanation": "Jugada colineal legal: Rd2 mantiene el desplazamiento sobre la línea compartida con d8. La alineación no demuestra que sea la mejor jugada.",
  "confidence": "candidate",
  "observations": [],
  "solutions": [
   [
    "d1d2"
   ],
   [
    "d1d3"
   ],
   [
    "d1d4"
   ],
   [
    "d1d5"
   ]
  ],
  "lines": [
   [
    "d1",
    "d2"
   ]
  ],
  "targets": [
   "d1"
  ],
  "solutionNotes": {
   "d1d2": "Jugada colineal legal: Rd2 mantiene el desplazamiento sobre la línea compartida con d8. La alineación no demuestra que sea la mejor jugada.",
   "d1d3": "Jugada colineal legal: Rd3 mantiene el desplazamiento sobre la línea compartida con d8. La alineación no demuestra que sea la mejor jugada.",
   "d1d4": "Jugada colineal legal: Rd4 mantiene el desplazamiento sobre la línea compartida con d8. La alineación no demuestra que sea la mejor jugada.",
   "d1d5": "Jugada colineal legal: Rd5 mantiene el desplazamiento sobre la línea compartida con d8. La alineación no demuestra que sea la mejor jugada."
  }
 },
 {
  "id": "cornerMate",
  "fen": "7k/7p/8/4N3/8/8/8/K5R1 w - - 0 1",
  "setup": [],
  "startFen": "7k/7p/8/4N3/8/8/8/K5R1 w - - 0 1",
  "task": "play",
  "prompt": "Encuentra el mate de la esquina.",
  "explanation": "Con Nf7#: Mate de la esquina. El caballo da jaque en la esquina y la pieza mayor cierra las otras dos salidas. Jaque mate comprobado por las reglas.",
  "confidence": "verified",
  "observations": [],
  "solutions": [
   [
    "e5f7"
   ]
  ],
  "lines": [],
  "targets": [
   "h8"
  ],
  "solutionNotes": {
   "e5f7": "Con Nf7#: Mate de la esquina. El caballo da jaque en la esquina y la pieza mayor cierra las otras dos salidas. Jaque mate comprobado por las reglas."
  }
 },
 {
  "id": "discoveredCheck",
  "fen": "4k3/8/8/8/8/8/4B3/K3R3 w - - 0 1",
  "setup": [],
  "startFen": "4k3/8/8/8/8/8/4B3/K3R3 w - - 0 1",
  "task": "play",
  "prompt": "Prueba una jugada que muestre jaque descubierto.",
  "explanation": "Mover e2 a d3 descubre un jaque desde e1.",
  "confidence": "pattern",
  "observations": [],
  "solutions": [
   [
    "e2d3"
   ]
  ],
  "lines": [
   [
    "e1",
    "e8"
   ]
  ],
  "targets": [
   "e2"
  ],
  "solutionNotes": {
   "e2d3": "Mover e2 a d3 descubre un jaque desde e1."
  }
 },
 {
  "id": "doubleBishopMate",
  "fen": "7k/7p/8/3B4/8/8/7B/K7 w - - 0 1",
  "setup": [],
  "startFen": "7k/7p/8/3B4/8/8/7B/K7 w - - 0 1",
  "task": "play",
  "prompt": "Encuentra el mate de dos alfiles.",
  "explanation": "Con Be5#: Mate de dos alfiles. Los alfiles cierran las salidas por diagonales vecinas desde el mismo lado. Jaque mate comprobado por las reglas.",
  "confidence": "verified",
  "observations": [],
  "solutions": [
   [
    "h2e5"
   ]
  ],
  "lines": [],
  "targets": [
   "h8"
  ],
  "solutionNotes": {
   "h2e5": "Con Be5#: Mate de dos alfiles. Los alfiles cierran las salidas por diagonales vecinas desde el mismo lado. Jaque mate comprobado por las reglas."
  }
 },
 {
  "id": "dovetailMate",
  "fen": "8/8/4p3/4kp2/3p4/2B5/8/K2Q4 w - - 0 1",
  "setup": [],
  "startFen": "8/8/4p3/4kp2/3p4/2B5/8/K2Q4 w - - 0 1",
  "task": "play",
  "prompt": "Encuentra el mate de cola de paloma.",
  "explanation": "Con Qxd4#: Mate cola de paloma. La dama da jaque en diagonal y dos piezas propias bloquean las dos casillas que quedan fuera de su alcance. Jaque mate comprobado por las reglas.",
  "confidence": "verified",
  "observations": [],
  "solutions": [
   [
    "d1d4"
   ]
  ],
  "lines": [],
  "targets": [
   "e5"
  ],
  "solutionNotes": {
   "d1d4": "Con Qxd4#: Mate cola de paloma. La dama da jaque en diagonal y dos piezas propias bloquean las dos casillas que quedan fuera de su alcance. Jaque mate comprobado por las reglas."
  }
 },
 {
  "id": "kingsideAttack",
  "fen": "6k1/8/8/2b5/7q/8/5PPP/6K1 w - - 0 1",
  "setup": [],
  "startFen": "6k1/8/8/2b5/7q/8/5PPP/6K1 w - - 0 1",
  "task": "spot",
  "prompt": "Toca el rey atacado en su flanco.",
  "explanation": "Presión de 2 piezas sobre el entorno del rey en el flanco de rey. Su ubicación sugiere el patrón; no demuestra que se haya enrocado ni una combinación ganadora.",
  "confidence": "pattern",
  "observations": [
   {
    "squares": [
     "g1",
     "c5",
     "h4"
    ],
    "message": "Presión de 2 piezas sobre el entorno del rey en el flanco de rey. Su ubicación sugiere el patrón; no demuestra que se haya enrocado ni una combinación ganadora.",
    "lines": [
     [
      "c5",
      "f2"
     ],
     [
      "h4",
      "f2"
     ]
    ]
   }
  ],
  "solutions": [],
  "lines": [
   [
    "c5",
    "f2"
   ],
   [
    "h4",
    "f2"
   ]
  ],
  "targets": [
   "g1"
  ]
 },
 {
  "id": "clearance",
  "fen": "4k3/8/8/8/8/8/4B3/K3R3 w - - 0 1",
  "setup": [],
  "startFen": "4k3/8/8/8/8/8/4B3/K3R3 w - - 0 1",
  "task": "play",
  "prompt": "Prueba una jugada que muestre despeje.",
  "explanation": "Bd3+ despeja la línea de e1 hacia e8. La apertura de la línea está comprobada; su utilidad depende de la respuesta.",
  "confidence": "verified",
  "observations": [],
  "solutions": [
   [
    "e2d3"
   ],
   [
    "e2c4"
   ],
   [
    "e2b5"
   ],
   [
    "e2a6"
   ]
  ],
  "lines": [
   [
    "e1",
    "e8"
   ],
   [
    "e2",
    "d3"
   ]
  ],
  "targets": [
   "e2"
  ],
  "solutionNotes": {
   "e2d3": "Bd3+ despeja la línea de e1 hacia e8. La apertura de la línea está comprobada; su utilidad depende de la respuesta.",
   "e2c4": "Bc4+ despeja la línea de e1 hacia e8. La apertura de la línea está comprobada; su utilidad depende de la respuesta.",
   "e2b5": "Bb5+ despeja la línea de e1 hacia e8. La apertura de la línea está comprobada; su utilidad depende de la respuesta.",
   "e2a6": "Ba6+ despeja la línea de e1 hacia e8. La apertura de la línea está comprobada; su utilidad depende de la respuesta."
  }
 },
 {
  "id": "defensiveMove",
  "fen": "3r3k/8/8/8/8/8/8/3Q3K w - - 0 1",
  "setup": [],
  "startFen": "3r3k/8/8/8/8/8/8/3Q3K w - - 0 1",
  "task": "play",
  "prompt": "Prueba una jugada que muestre jugada defensiva.",
  "explanation": "Qc2 evita la captura inmediata de dama en d1. No hay una captura legal inmediata de esa pieza en la posición resultante; otras amenazas requieren análisis.",
  "confidence": "verified",
  "observations": [],
  "solutions": [
   [
    "d1c2"
   ],
   [
    "d1b3"
   ],
   [
    "d1a4"
   ],
   [
    "d1d8"
   ]
  ],
  "lines": [
   [
    "d1",
    "c2"
   ]
  ],
  "targets": [
   "d1"
  ],
  "solutionNotes": {
   "d1c2": "Qc2 evita la captura inmediata de dama en d1. No hay una captura legal inmediata de esa pieza en la posición resultante; otras amenazas requieren análisis.",
   "d1b3": "Qb3 evita la captura inmediata de dama en d1. No hay una captura legal inmediata de esa pieza en la posición resultante; otras amenazas requieren análisis.",
   "d1a4": "Qa4 evita la captura inmediata de dama en d1. No hay una captura legal inmediata de esa pieza en la posición resultante; otras amenazas requieren análisis.",
   "d1d8": "Qxd8+ evita la captura inmediata de dama en d1. No hay una captura legal inmediata de esa pieza en la posición resultante; otras amenazas requieren análisis."
  }
 },
 {
  "id": "deflection",
  "fen": "3r2n1/7k/8/3n4/8/8/8/K2R2R1 w - - 0 1",
  "setup": [],
  "startFen": "3r2n1/7k/8/3n4/8/8/8/K2R2R1 w - - 0 1",
  "task": "play",
  "prompt": "Prueba una jugada que muestre desviación.",
  "explanation": "Rxd5 intenta desviar al defensor de d8. Si acepta Rxd5, deja su defensa de g8 y existe Rxg8. El rival puede rechazar la oferta.",
  "confidence": "candidate",
  "observations": [],
  "solutions": [
   [
    "d1d5",
    "d8d5",
    "g1g8"
   ],
   [
    "g1g8",
    "d8g8",
    "d1d5"
   ]
  ],
  "lines": [
   [
    "d8",
    "g8"
   ],
   [
    "d8",
    "d5"
   ]
  ],
  "targets": [
   "d8"
  ],
  "solutionNotes": {
   "d1d5 d8d5 g1g8": "Rxd5 intenta desviar al defensor de d8. Si acepta Rxd5, deja su defensa de g8 y existe Rxg8. El rival puede rechazar la oferta.",
   "g1g8 d8g8 d1d5": "Rxg8 intenta desviar al defensor de d8. Si acepta Rxg8, deja su defensa de d5 y existe Rxd5. El rival puede rechazar la oferta."
  }
 },
 {
  "id": "discoveredAttack",
  "fen": "4k3/8/8/8/8/8/4B3/K3R3 w - - 0 1",
  "setup": [],
  "startFen": "4k3/8/8/8/8/8/4B3/K3R3 w - - 0 1",
  "task": "play",
  "prompt": "Prueba una jugada que muestre ataque descubierto.",
  "explanation": "Al mover e2 a d3, se abre la línea de e1 hacia e8. La jugada es legal; la ganancia no está evaluada.",
  "confidence": "pattern",
  "observations": [],
  "solutions": [
   [
    "e2d3"
   ]
  ],
  "lines": [
   [
    "e1",
    "e8"
   ]
  ],
  "targets": [
   "e2"
  ],
  "solutionNotes": {
   "e2d3": "Al mover e2 a d3, se abre la línea de e1 hacia e8. La jugada es legal; la ganancia no está evaluada."
  }
 },
 {
  "id": "doubleCheck",
  "fen": "4k3/8/8/8/8/8/4B3/K3R3 w - - 0 1",
  "setup": [
   "Bb5+"
  ],
  "startFen": "4k3/8/8/1B6/8/8/8/K3R3 b - - 1 1",
  "task": "spot",
  "prompt": "Toca el rey que recibe dos jaques.",
  "explanation": "Dos piezas dan jaque al rey en e8. Debes mover el rey.",
  "confidence": "verified",
  "observations": [
   {
    "squares": [
     "e8",
     "b5",
     "e1"
    ],
    "message": "Dos piezas dan jaque al rey en e8. Debes mover el rey.",
    "lines": [
     [
      "b5",
      "e8"
     ],
     [
      "e1",
      "e8"
     ]
    ]
   }
  ],
  "solutions": [],
  "lines": [
   [
    "b5",
    "e8"
   ],
   [
    "e1",
    "e8"
   ]
  ],
  "targets": [
   "e8"
  ]
 },
 {
  "id": "epauletteMate",
  "fen": "2rkr3/8/8/8/8/8/7Q/K7 w - - 0 1",
  "setup": [],
  "startFen": "2rkr3/8/8/8/8/8/7Q/K7 w - - 0 1",
  "task": "play",
  "prompt": "Encuentra el mate de las charreteras.",
  "explanation": "Con Qd6#: Mate de las charreteras. Dos piezas del propio rey forman las charreteras a ambos lados de la línea de jaque. Jaque mate comprobado por las reglas.",
  "confidence": "verified",
  "observations": [],
  "solutions": [
   [
    "h2d6"
   ]
  ],
  "lines": [],
  "targets": [
   "d8"
  ],
  "solutionNotes": {
   "h2d6": "Con Qd6#: Mate de las charreteras. Dos piezas del propio rey forman las charreteras a ambos lados de la línea de jaque. Jaque mate comprobado por las reglas."
  }
 },
 {
  "id": "exposedKing",
  "fen": "6k1/8/8/2b5/7q/8/8/6K1 w - - 0 1",
  "setup": [],
  "startFen": "6k1/8/8/2b5/7q/8/8/6K1 w - - 0 1",
  "task": "spot",
  "prompt": "Toca el rey con poca cobertura.",
  "explanation": "Rey con poca cobertura: 0 peones delante y 4 casillas próximas bajo presión geométrica. Es una señal de exposición, no una prueba de mate.",
  "confidence": "pattern",
  "observations": [
   {
    "squares": [
     "g1",
     "c5",
     "h4"
    ],
    "message": "Rey con poca cobertura: 0 peones delante y 4 casillas próximas bajo presión geométrica. Es una señal de exposición, no una prueba de mate.",
    "lines": []
   }
  ],
  "solutions": [],
  "lines": [],
  "targets": [
   "g1"
  ]
 },
 {
  "id": "fork",
  "fen": "r1k5/8/1N6/8/8/8/8/6K1 b - - 0 1",
  "setup": [],
  "startFen": "r1k5/8/1N6/8/8/8/8/6K1 b - - 0 1",
  "task": "spot",
  "prompt": "Toca la pieza que ataca dos objetivos.",
  "explanation": "caballo en b6 ataca a8 y c8. Es un patrón de ataque doble; no garantiza ganar material.",
  "confidence": "pattern",
  "observations": [
   {
    "squares": [
     "b6",
     "a8",
     "c8"
    ],
    "message": "caballo en b6 ataca a8 y c8. Es un patrón de ataque doble; no garantiza ganar material.",
    "lines": [
     [
      "b6",
      "a8"
     ],
     [
      "b6",
      "c8"
     ]
    ]
   }
  ],
  "solutions": [],
  "lines": [
   [
    "b6",
    "a8"
   ],
   [
    "b6",
    "c8"
   ]
  ],
  "targets": [
   "b6"
  ]
 },
 {
  "id": "hangingPiece",
  "fen": "7k/q7/8/8/8/8/8/R6K w - - 0 1",
  "setup": [],
  "startFen": "7k/q7/8/8/8/8/8/R6K w - - 0 1",
  "task": "play",
  "prompt": "Prueba una jugada que muestre pieza colgada.",
  "explanation": "Rxa7: saldo local de +9 peones al comprobar las capturas y recapturas legales sobre a7. La pieza se puede capturar sin perder el saldo material en ese intercambio. No incluye amenazas intermedias en otras casillas.",
  "confidence": "verified",
  "observations": [],
  "solutions": [
   [
    "a1a7"
   ]
  ],
  "lines": [
   [
    "a1",
    "a7"
   ]
  ],
  "targets": [
   "a7"
  ],
  "solutionNotes": {
   "a1a7": "Rxa7: saldo local de +9 peones al comprobar las capturas y recapturas legales sobre a7. La pieza se puede capturar sin perder el saldo material en ese intercambio. No incluye amenazas intermedias en otras casillas."
  }
 },
 {
  "id": "hookMate",
  "fen": "8/R7/4kp2/5N2/4P3/8/8/K7 w - - 0 1",
  "setup": [],
  "startFen": "8/R7/4kp2/5N2/4P3/8/8/K7 w - - 0 1",
  "task": "play",
  "prompt": "Encuentra el mate de gancho.",
  "explanation": "Con Re7#: Mate del gancho. La torre está protegida por el caballo, el caballo por un peón y un peón del rey obstruye su salida. Jaque mate comprobado por las reglas.",
  "confidence": "verified",
  "observations": [],
  "solutions": [
   [
    "a7e7"
   ]
  ],
  "lines": [],
  "targets": [
   "e6"
  ],
  "solutionNotes": {
   "a7e7": "Con Re7#: Mate del gancho. La torre está protegida por el caballo, el caballo por un peón y un peón del rey obstruye su salida. Jaque mate comprobado por las reglas."
  }
 },
 {
  "id": "interference",
  "fen": "4r2k/8/8/8/3Nq3/8/8/K3R3 w - - 0 1",
  "setup": [],
  "startFen": "4r2k/8/8/8/3Nq3/8/8/K3R3 w - - 0 1",
  "task": "play",
  "prompt": "Prueba una jugada que muestre interferencia.",
  "explanation": "Ne6 se interpone entre el defensor e8 y e4. Puede ser una interferencia útil, pero el rival puede capturar la pieza interpuesta.",
  "confidence": "pattern",
  "observations": [],
  "solutions": [
   [
    "d4e6"
   ]
  ],
  "lines": [
   [
    "e8",
    "e4"
   ],
   [
    "d4",
    "e6"
   ]
  ],
  "targets": [
   "e6"
  ],
  "solutionNotes": {
   "d4e6": "Ne6 se interpone entre el defensor e8 y e4. Puede ser una interferencia útil, pero el rival puede capturar la pieza interpuesta."
  }
 },
 {
  "id": "intermezzo",
  "fen": "7k/8/8/8/2p5/1N6/P7/K2Q4 b - - 0 1",
  "setup": [
   "cxb3"
  ],
  "startFen": "7k/8/8/8/8/1p6/P7/K2Q4 w - - 0 2",
  "task": "play",
  "prompt": "Prueba una jugada que muestre jugada intermedia.",
  "explanation": "Qd4+ introduce un jaque antes de la recaptura disponible en b3. Tras 2 de 2 respuestas legales comprobadas sigue existiendo una recaptura. No se garantiza que sea mejor.",
  "confidence": "candidate",
  "observations": [],
  "solutions": [
   [
    "d1d4"
   ],
   [
    "d1d8"
   ],
   [
    "d1h5"
   ],
   [
    "d1h1"
   ]
  ],
  "lines": [
   [
    "d1",
    "d4"
   ]
  ],
  "targets": [
   "d1"
  ],
  "solutionNotes": {
   "d1d4": "Qd4+ introduce un jaque antes de la recaptura disponible en b3. Tras 2 de 2 respuestas legales comprobadas sigue existiendo una recaptura. No se garantiza que sea mejor.",
   "d1d8": "Qd8+ introduce un jaque antes de la recaptura disponible en b3. Tras 2 de 2 respuestas legales comprobadas sigue existiendo una recaptura. No se garantiza que sea mejor.",
   "d1h5": "Qh5+ introduce un jaque antes de la recaptura disponible en b3. Tras 2 de 2 respuestas legales comprobadas sigue existiendo una recaptura. No se garantiza que sea mejor.",
   "d1h1": "Qh1+ introduce un jaque antes de la recaptura disponible en b3. Tras 2 de 2 respuestas legales comprobadas sigue existiendo una recaptura. No se garantiza que sea mejor."
  }
 },
 {
  "id": "killBoxMate",
  "fen": "8/4K1k1/7R/8/8/8/8/5Q2 w - - 0 1",
  "setup": [],
  "startFen": "8/4K1k1/7R/8/8/8/8/5Q2 w - - 0 1",
  "task": "play",
  "prompt": "Encuentra el mate de kill box.",
  "explanation": "Con Qf8#: Mate kill box. La dama y la torre ocupan esquinas opuestas de un cuadro de tres por tres y cierran salidas distintas. Jaque mate comprobado por las reglas.",
  "confidence": "verified",
  "observations": [],
  "solutions": [
   [
    "f1f8"
   ]
  ],
  "lines": [],
  "targets": [
   "g7"
  ],
  "solutionNotes": {
   "f1f8": "Con Qf8#: Mate kill box. La dama y la torre ocupan esquinas opuestas de un cuadro de tres por tres y cierran salidas distintas. Jaque mate comprobado por las reglas."
  }
 },
 {
  "id": "pillsburysMate",
  "fen": "7k/6p1/8/8/2B5/8/8/KR6 w - - 0 1",
  "setup": [],
  "startFen": "7k/6p1/8/8/2B5/8/8/KR6 w - - 0 1",
  "task": "play",
  "prompt": "Encuentra el mate de Pillsbury.",
  "explanation": "Con Rh1#: Mate de Pillsbury. La torre da jaque desde lejos y el alfil impide salir del borde. Jaque mate comprobado por las reglas.",
  "confidence": "verified",
  "observations": [],
  "solutions": [
   [
    "b1h1"
   ]
  ],
  "lines": [],
  "targets": [
   "h8"
  ],
  "solutionNotes": {
   "b1h1": "Con Rh1#: Mate de Pillsbury. La torre da jaque desde lejos y el alfil impide salir del borde. Jaque mate comprobado por las reglas."
  }
 },
 {
  "id": "morphysMate",
  "fen": "7k/7p/8/8/8/8/8/K3B1R1 w - - 0 1",
  "setup": [],
  "startFen": "7k/7p/8/8/8/8/8/K3B1R1 w - - 0 1",
  "task": "play",
  "prompt": "Encuentra el mate de Morphy.",
  "explanation": "Con Bc3#: Mate de Morphy. El alfil da el jaque y la torre cierra las salidas junto al borde. Jaque mate comprobado por las reglas.",
  "confidence": "verified",
  "observations": [],
  "solutions": [
   [
    "e1c3"
   ]
  ],
  "lines": [],
  "targets": [
   "h8"
  ],
  "solutionNotes": {
   "e1c3": "Con Bc3#: Mate de Morphy. El alfil da el jaque y la torre cierra las salidas junto al borde. Jaque mate comprobado por las reglas."
  }
 },
 {
  "id": "swallowstailMate",
  "fen": "8/8/3p1p2/4k3/8/8/6B1/KQ6 w - - 0 1",
  "setup": [],
  "startFen": "8/8/3p1p2/4k3/8/8/6B1/KQ6 w - - 0 1",
  "task": "play",
  "prompt": "Encuentra el mate de cola de golondrina.",
  "explanation": "Con Qe4#: Mate cola de golondrina. La dama da jaque de frente y las dos piezas de atrás forman la cola en V. Jaque mate comprobado por las reglas.",
  "confidence": "verified",
  "observations": [],
  "solutions": [
   [
    "b1e4"
   ]
  ],
  "lines": [],
  "targets": [
   "e5"
  ],
  "solutionNotes": {
   "b1e4": "Con Qe4#: Mate cola de golondrina. La dama da jaque de frente y las dos piezas de atrás forman la cola en V. Jaque mate comprobado por las reglas."
  }
 },
 {
  "id": "triangleMate",
  "fen": "3k4/4R3/8/8/8/8/8/K1Q5 w - - 0 1",
  "setup": [],
  "startFen": "3k4/4R3/8/8/8/8/8/K1Q5 w - - 0 1",
  "task": "play",
  "prompt": "Encuentra el mate de triángulo.",
  "explanation": "Con Qc7#: Mate del triángulo. Dama, torre y rey forman un triángulo; la torre protege a la dama y cierra otra salida. Jaque mate comprobado por las reglas.",
  "confidence": "verified",
  "observations": [],
  "solutions": [
   [
    "c1c7"
   ]
  ],
  "lines": [],
  "targets": [
   "d8"
  ],
  "solutionNotes": {
   "c1c7": "Con Qc7#: Mate del triángulo. Dama, torre y rey forman un triángulo; la torre protege a la dama y cierra otra salida. Jaque mate comprobado por las reglas."
  }
 },
 {
  "id": "vukovicMate",
  "fen": "6k1/R7/6N1/8/3B4/8/8/K7 w - - 0 1",
  "setup": [],
  "startFen": "6k1/R7/6N1/8/3B4/8/8/K7 w - - 0 1",
  "task": "play",
  "prompt": "Encuentra el mate de Vuković.",
  "explanation": "Con Rg7#: Mate de Vuković. La torre está entre el rey y el caballo; una tercera pieza la protege y el caballo cierra ambos lados. Jaque mate comprobado por las reglas.",
  "confidence": "verified",
  "observations": [],
  "solutions": [
   [
    "a7g7"
   ]
  ],
  "lines": [],
  "targets": [
   "g8"
  ],
  "solutionNotes": {
   "a7g7": "Con Rg7#: Mate de Vuković. La torre está entre el rey y el caballo; una tercera pieza la protege y el caballo cierra ambos lados. Jaque mate comprobado por las reglas."
  }
 },
 {
  "id": "mate",
  "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  "setup": [
   "f3",
   "e5",
   "g4",
   "Qh4#"
  ],
  "startFen": "rnb1kbnr/pppp1ppp/8/4p3/6Pq/5P2/PPPPP2P/RNBQKBNR w KQkq - 1 3",
  "task": "spot",
  "prompt": "Toca el rey que está en jaque mate.",
  "explanation": "Jaque mate: no existe ninguna respuesta legal.",
  "confidence": "verified",
  "observations": [
   {
    "squares": [
     "e1"
    ],
    "message": "Jaque mate: no existe ninguna respuesta legal.",
    "lines": []
   }
  ],
  "solutions": [],
  "lines": [],
  "targets": [
   "e1"
  ]
 },
 {
  "id": "mateIn1",
  "fen": "7k/5Q2/6K1/8/8/8/8/8 w - - 0 1",
  "setup": [],
  "startFen": "7k/5Q2/6K1/8/8/8/8/8 w - - 0 1",
  "task": "play",
  "prompt": "Prueba una jugada que muestre mate en una.",
  "explanation": "Mate en una comprobado: Qe8#.",
  "confidence": "verified",
  "observations": [],
  "solutions": [
   [
    "f7e8"
   ],
   [
    "f7f8"
   ],
   [
    "f7g7"
   ],
   [
    "f7h7"
   ]
  ],
  "lines": [
   [
    "f7",
    "e8"
   ]
  ],
  "targets": [
   "f7"
  ],
  "solutionNotes": {
   "f7e8": "Mate en una comprobado: Qe8#.",
   "f7f8": "Mate en una comprobado: Qf8#.",
   "f7g7": "Mate en una comprobado: Qg7#.",
   "f7h7": "Mate en una comprobado: Qh7#."
  }
 },
 {
  "id": "mateIn2",
  "fen": "5r1k/6pp/4Q2N/8/8/8/6PP/6K1 w - - 3 3",
  "setup": [],
  "startFen": "5r1k/6pp/4Q2N/8/8/8/6PP/6K1 w - - 3 3",
  "task": "play",
  "prompt": "Recorre un mate forzado en 2 jugadas propias. Verás las respuestas del rival paso a paso.",
  "explanation": "Mate forzado en 2 jugadas comprobado: Qg8+. Se verificaron todas las defensas legales dentro de este horizonte.",
  "confidence": "verified",
  "observations": [],
  "solutions": [
   [
    "e6g8",
    "f8g8",
    "h6f7"
   ]
  ],
  "lines": [
   [
    "e6",
    "g8"
   ]
  ],
  "targets": [
   "e6"
  ],
  "mateDistance": 2,
  "solutionNotes": {}
 },
 {
  "id": "mateIn3",
  "fen": "5rk1/5Npp/4Q3/8/8/8/6PP/6K1 w - - 1 2",
  "setup": [],
  "startFen": "5rk1/5Npp/4Q3/8/8/8/6PP/6K1 w - - 1 2",
  "task": "play",
  "prompt": "Recorre un mate forzado en 3 jugadas propias. Verás las respuestas del rival paso a paso.",
  "explanation": "Mate forzado en 3 jugadas comprobado: Nh6+. Se verificaron todas las defensas legales dentro de este horizonte.",
  "confidence": "verified",
  "observations": [],
  "solutions": [
   [
    "f7h6",
    "g8h8",
    "e6g8",
    "f8g8",
    "h6f7"
   ]
  ],
  "lines": [
   [
    "f7",
    "h6"
   ]
  ],
  "targets": [
   "f7"
  ],
  "mateDistance": 3,
  "solutionNotes": {}
 },
 {
  "id": "mateIn4",
  "fen": "5r1k/6pp/4Q3/6N1/8/8/6PP/6K1 w - - 0 1",
  "setup": [],
  "startFen": "5r1k/6pp/4Q3/6N1/8/8/6PP/6K1 w - - 0 1",
  "task": "play",
  "prompt": "Recorre un mate forzado en 4 jugadas propias. Verás las respuestas del rival paso a paso.",
  "explanation": "Mate forzado en 4 jugadas comprobado: Nf7+. Se verificaron todas las defensas legales dentro de este horizonte.",
  "confidence": "verified",
  "observations": [],
  "solutions": [
   [
    "g5f7",
    "h8g8",
    "f7h6",
    "g8h8",
    "e6g8",
    "f8g8",
    "h6f7"
   ]
  ],
  "lines": [
   [
    "g5",
    "f7"
   ]
  ],
  "targets": [
   "g5"
  ],
  "mateDistance": 4,
  "solutionNotes": {}
 },
 {
  "id": "mateIn5",
  "fen": "5rk1/6pp/8/6N1/8/4Q3/6PP/6K1 w - - 0 1",
  "setup": [],
  "startFen": "5rk1/6pp/8/6N1/8/4Q3/6PP/6K1 w - - 0 1",
  "task": "play",
  "prompt": "Recorre un mate forzado en 5 jugadas propias. Verás las respuestas del rival paso a paso.",
  "explanation": "Mate forzado en 5 jugadas comprobado: Qe6+. Se verificaron todas las defensas legales dentro de este horizonte.",
  "confidence": "verified",
  "observations": [],
  "solutions": [
   [
    "e3e6",
    "g8h8",
    "g5f7",
    "h8g8",
    "f7h6",
    "g8h8",
    "e6g8",
    "f8g8",
    "h6f7"
   ]
  ],
  "lines": [
   [
    "e3",
    "e6"
   ]
  ],
  "targets": [
   "e3"
  ],
  "mateDistance": 5,
  "solutionNotes": {}
 },
 {
  "id": "operaMate",
  "fen": "4k3/5p2/8/6B1/8/8/8/K2R4 w - - 0 1",
  "setup": [],
  "startFen": "4k3/5p2/8/6B1/8/8/8/K2R4 w - - 0 1",
  "task": "play",
  "prompt": "Encuentra el mate de la ópera.",
  "explanation": "Con Rd8#: Mate de la ópera. El alfil protege directamente la torre que da mate y también cierra una salida del rey. Jaque mate comprobado por las reglas.",
  "confidence": "verified",
  "observations": [],
  "solutions": [
   [
    "d1d8"
   ]
  ],
  "lines": [],
  "targets": [
   "e8"
  ],
  "solutionNotes": {
   "d1d8": "Con Rd8#: Mate de la ópera. El alfil protege directamente la torre que da mate y también cierra una salida del rey. Jaque mate comprobado por las reglas."
  }
 },
 {
  "id": "pin",
  "fen": "4k3/4n3/8/8/8/8/8/K3R3 b - - 0 1",
  "setup": [],
  "startFen": "4k3/4n3/8/8/8/8/8/K3R3 b - - 0 1",
  "task": "spot",
  "prompt": "Toca la pieza clavada.",
  "explanation": "caballo en e7 queda delante de rey en e8. No puede moverse si deja al rey en jaque.",
  "confidence": "pattern",
  "observations": [
   {
    "squares": [
     "e7",
     "e1",
     "e8"
    ],
    "message": "caballo en e7 queda delante de rey en e8. No puede moverse si deja al rey en jaque.",
    "lines": [
     [
      "e1",
      "e8"
     ]
    ]
   }
  ],
  "solutions": [],
  "lines": [
   [
    "e1",
    "e8"
   ]
  ],
  "targets": [
   "e7"
  ]
 },
 {
  "id": "promotion",
  "fen": "7k/P7/8/8/8/8/8/6K1 w - - 0 1",
  "setup": [],
  "startFen": "7k/P7/8/8/8/8/8/6K1 w - - 0 1",
  "task": "play",
  "prompt": "Corona el peón a dama.",
  "explanation": "Puedes coronar a dama con a8=Q+.",
  "confidence": "verified",
  "observations": [],
  "solutions": [
   [
    "a7a8q"
   ]
  ],
  "lines": [
   [
    "a7",
    "a8"
   ]
  ],
  "targets": [
   "a7"
  ],
  "solutionNotes": {
   "a7a8q": "Puedes coronar a dama con a8=Q+."
  }
 },
 {
  "id": "queensideAttack",
  "fen": "1k6/8/8/5b2/q7/8/PPP5/1K6 w - - 0 1",
  "setup": [],
  "startFen": "1k6/8/8/5b2/q7/8/PPP5/1K6 w - - 0 1",
  "task": "spot",
  "prompt": "Toca el rey atacado en el flanco de dama.",
  "explanation": "Presión de 2 piezas sobre el entorno del rey en el flanco de dama. Su ubicación sugiere el patrón; no demuestra que se haya enrocado ni una combinación ganadora.",
  "confidence": "pattern",
  "observations": [
   {
    "squares": [
     "b1",
     "f5",
     "a4"
    ],
    "message": "Presión de 2 piezas sobre el entorno del rey en el flanco de dama. Su ubicación sugiere el patrón; no demuestra que se haya enrocado ni una combinación ganadora.",
    "lines": [
     [
      "f5",
      "c2"
     ],
     [
      "a4",
      "a2"
     ]
    ]
   }
  ],
  "solutions": [],
  "lines": [
   [
    "f5",
    "c2"
   ],
   [
    "a4",
    "a2"
   ]
  ],
  "targets": [
   "b1"
  ]
 },
 {
  "id": "quietMove",
  "fen": "7k/8/8/3q4/8/8/8/KN6 w - - 0 1",
  "setup": [],
  "startFen": "7k/8/8/3q4/8/8/8/KN6 w - - 0 1",
  "task": "play",
  "prompt": "Prueba una jugada que muestre jugada tranquila.",
  "explanation": "Nc3 prepara un ataque a d5 sin capturar ni dar jaque. Es una amenaza candidata, no una ganancia forzada.",
  "confidence": "candidate",
  "observations": [],
  "solutions": [
   [
    "b1c3"
   ]
  ],
  "lines": [
   [
    "c3",
    "d5"
   ]
  ],
  "targets": [
   "b1"
  ],
  "solutionNotes": {
   "b1c3": "Nc3 prepara un ataque a d5 sin capturar ni dar jaque. Es una amenaza candidata, no una ganancia forzada."
  }
 },
 {
  "id": "sacrifice",
  "fen": "2r4k/8/8/2p3q1/8/6N1/8/K1R5 w - - 0 1",
  "setup": [],
  "startFen": "2r4k/8/8/2p3q1/8/6N1/8/K1R5 w - - 0 1",
  "task": "play",
  "prompt": "Prueba una jugada que muestre sacrificio.",
  "explanation": "Nf5 ofrece caballo. Si el rival acepta con Qxf5, Rxc5 crea un ataque doble como posible compensación. La oferta puede ser rechazada; no se afirma que el sacrificio gane contra todas las respuestas.",
  "confidence": "candidate",
  "observations": [],
  "solutions": [
   [
    "g3f5",
    "g5f5",
    "c1c5"
   ],
   [
    "g3h5",
    "g5h5",
    "c1c5"
   ],
   [
    "c1c5",
    "c8c5",
    "g3e4"
   ]
  ],
  "lines": [
   [
    "g3",
    "f5"
   ],
   [
    "c1",
    "c5"
   ]
  ],
  "targets": [
   "g3",
   "c1"
  ],
  "solutionNotes": {
   "g3f5 g5f5 c1c5": "Nf5 ofrece caballo. Si el rival acepta con Qxf5, Rxc5 crea un ataque doble como posible compensación. La oferta puede ser rechazada; no se afirma que el sacrificio gane contra todas las respuestas.",
   "g3h5 g5h5 c1c5": "Nh5 ofrece caballo. Si el rival acepta con Qxh5, Rxc5 crea un ataque doble como posible compensación. La oferta puede ser rechazada; no se afirma que el sacrificio gane contra todas las respuestas.",
   "c1c5 c8c5 g3e4": "Rxc5 ofrece torre. Si el rival acepta con Rxc5, Ne4 crea un ataque doble como posible compensación. La oferta puede ser rechazada; no se afirma que el sacrificio gane contra todas las respuestas."
  }
 },
 {
  "id": "skewer",
  "fen": "6k1/4r3/8/4q3/8/8/8/K3R3 b - - 0 1",
  "setup": [],
  "startFen": "6k1/4r3/8/4q3/8/8/8/K3R3 b - - 0 1",
  "task": "spot",
  "prompt": "Toca la pieza de delante en la enfilada.",
  "explanation": "La pieza de mayor valor en e5 está delante de e7 en la línea de e1. Es una enfilada geométrica; hay que evaluar las respuestas.",
  "confidence": "pattern",
  "observations": [
   {
    "squares": [
     "e5",
     "e1",
     "e7"
    ],
    "message": "La pieza de mayor valor en e5 está delante de e7 en la línea de e1. Es una enfilada geométrica; hay que evaluar las respuestas.",
    "lines": [
     [
      "e1",
      "e7"
     ]
    ]
   }
  ],
  "solutions": [],
  "lines": [
   [
    "e1",
    "e7"
   ]
  ],
  "targets": [
   "e5"
  ]
 },
 {
  "id": "smotheredMate",
  "fen": "6rk/6pp/8/4N3/8/8/8/K7 w - - 0 1",
  "setup": [],
  "startFen": "6rk/6pp/8/4N3/8/8/8/K7 w - - 0 1",
  "task": "play",
  "prompt": "Encuentra el mate de la coz.",
  "explanation": "Con Nf7#: Mate de la coz. El caballo salta sobre el cerco formado por todas las piezas propias del rey. Jaque mate comprobado por las reglas.",
  "confidence": "verified",
  "observations": [],
  "solutions": [
   [
    "e5f7"
   ]
  ],
  "lines": [],
  "targets": [
   "h8"
  ],
  "solutionNotes": {
   "e5f7": "Con Nf7#: Mate de la coz. El caballo salta sobre el cerco formado por todas las piezas propias del rey. Jaque mate comprobado por las reglas."
  }
 },
 {
  "id": "trappedPiece",
  "fen": "7k/8/8/8/2p5/3b4/1b6/N6K w - - 0 1",
  "setup": [],
  "startFen": "7k/8/8/8/2p5/3b4/1b6/N6K w - - 0 1",
  "task": "spot",
  "prompt": "Toca la pieza que parece atrapada.",
  "explanation": "caballo en a1 no tiene un movimiento legal que evite una captura inmediata (2 salidas comprobadas). Es un posible encierro: otra pieza podría defender, capturar al atacante o crear una amenaza.",
  "confidence": "candidate",
  "observations": [
   {
    "squares": [
     "a1",
     "b2"
    ],
    "message": "caballo en a1 no tiene un movimiento legal que evite una captura inmediata (2 salidas comprobadas). Es un posible encierro: otra pieza podría defender, capturar al atacante o crear una amenaza.",
    "lines": [
     [
      "b2",
      "a1"
     ]
    ]
   }
  ],
  "solutions": [],
  "lines": [
   [
    "b2",
    "a1"
   ]
  ],
  "targets": [
   "a1"
  ]
 },
 {
  "id": "underPromotion",
  "fen": "7k/P7/8/8/8/8/8/6K1 w - - 0 1",
  "setup": [],
  "startFen": "7k/P7/8/8/8/8/8/6K1 w - - 0 1",
  "task": "play",
  "prompt": "Corona el peón a torre, alfil o caballo.",
  "explanation": "Puedes coronar a torre con a8=R+.",
  "confidence": "verified",
  "observations": [],
  "solutions": [
   [
    "a7a8r"
   ],
   [
    "a7a8b"
   ],
   [
    "a7a8n"
   ]
  ],
  "lines": [
   [
    "a7",
    "a8"
   ]
  ],
  "targets": [
   "a7"
  ],
  "solutionNotes": {
   "a7a8r": "Puedes coronar a torre con a8=R+.",
   "a7a8b": "Puedes coronar a alfil con a8=B.",
   "a7a8n": "Puedes coronar a caballo con a8=N."
  }
 },
 {
  "id": "xRayAttack",
  "fen": "4k3/8/8/3q4/2p5/8/B7/6K1 w - - 0 1",
  "setup": [],
  "startFen": "4k3/8/8/3q4/2p5/8/B7/6K1 w - - 0 1",
  "task": "spot",
  "prompt": "Toca la pieza que ejerce presión por rayos X.",
  "explanation": "alfil en a2 tiene una línea hacia d5 bloqueada por la pieza rival en c4. Es presión por rayos X; no un ataque directo a través del bloqueo.",
  "confidence": "pattern",
  "observations": [
   {
    "squares": [
     "a2",
     "c4",
     "d5"
    ],
    "message": "alfil en a2 tiene una línea hacia d5 bloqueada por la pieza rival en c4. Es presión por rayos X; no un ataque directo a través del bloqueo.",
    "lines": [
     [
      "a2",
      "d5"
     ]
    ]
   }
  ],
  "solutions": [],
  "lines": [
   [
    "a2",
    "d5"
   ]
  ],
  "targets": [
   "a2"
  ]
 },
 {
  "id": "zugzwang",
  "fen": "8/8/8/5Kp1/6Pk/8/8/8 w - - 0 1",
  "setup": [],
  "startFen": "8/8/8/5Kp1/6Pk/8/8/8 w - - 0 1",
  "task": "spot",
  "prompt": "Toca una pieza del bando obligado a mover.",
  "explanation": "Candidato a zugzwang: se compararon las 5 jugadas legales con un pase hipotético. A profundidad 4, la mejor jugada resulta 2.0 peones peor que pasar. El pase no es legal y la búsqueda limitada no prueba el resultado del final.",
  "confidence": "candidate",
  "observations": [
   {
    "squares": [
     "f5",
     "g4"
    ],
    "message": "Candidato a zugzwang: se compararon las 5 jugadas legales con un pase hipotético. A profundidad 4, la mejor jugada resulta 2.0 peones peor que pasar. El pase no es legal y la búsqueda limitada no prueba el resultado del final.",
    "lines": []
   }
  ],
  "solutions": [],
  "lines": [],
  "targets": [
   "f5",
   "g4"
  ]
 }
];
