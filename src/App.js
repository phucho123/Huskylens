import './App.css';
import { Uart } from './components/Uart';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <div style={{ marginBottom: 50 }}>Huskylens Command Sender</div>
        <Uart />
      </header>
    </div>
  );
}

export default App;
