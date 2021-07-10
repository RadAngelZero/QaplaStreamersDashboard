import React from 'react';

import './App.css';
import Router from './Router';

function App() {
    return (
        <React.Suspense fallback=''>
            <Router />
        </React.Suspense>
    );
}

export default App;
