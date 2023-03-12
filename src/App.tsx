import React from 'react';
import './App.css';
import Scene from './components/threed/scene';

function App() {
  return (
    <div
      className='App'
      style={{
        width: '100vw',
        height: '100vh',
      }}>
      <Scene />
    </div>
  );
}

export default App;
