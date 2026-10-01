import React from 'react';
import {createRoot} from 'react-dom/client';
if(location.pathname==='/playground'){
  import('./SamplerDemo.jsx').then(({default:Demo})=>createRoot(document.getElementById('root')).render(<Demo/>));
}else{
  import('./studio/Studio.jsx').then(({default:Studio})=>createRoot(document.getElementById('root')).render(<Studio/>));
}
