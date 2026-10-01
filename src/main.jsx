import React from 'react';
import {createRoot} from 'react-dom/client';
if(location.pathname==='/project-bridge'){
  import('./ProjectBridgeDemo.jsx').then(({default:Demo})=>createRoot(document.getElementById('root')).render(<Demo/>));
}else if(location.pathname==='/studio'){
  import('./studio/Studio.jsx').then(({default:Studio})=>createRoot(document.getElementById('root')).render(<Studio/>));
}else{
  import('./SamplerDemo.jsx').then(({default:Demo})=>createRoot(document.getElementById('root')).render(<Demo/>));
}
