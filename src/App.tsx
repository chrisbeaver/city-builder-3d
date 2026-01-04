import GameCanvas from '@/components/GameCanvas';
import './App.css';

function App() {
  return (
    <div className="app">
      <div className="ui-overlay">
        <div className="controls">
          <h2>City Builder</h2>
          <p>Left Click: Place Building</p>
          <p>Right Click: Remove Building</p>
          <p>Mouse Drag: Rotate Camera</p>
          <p>Scroll: Zoom</p>
        </div>
      </div>
      <GameCanvas />
    </div>
  );
}

export default App;
