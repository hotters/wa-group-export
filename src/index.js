import React, { useState } from "react";
import ReactDOM from "react-dom";

const apiUrl = 'http://localhost:'

function App() {
    const [qr, setQr] = useState('');
    const [loading, setLoading] = useState(false);
    const logIn = () => {
        setLoading(true);
        fetch('http://localhost:3001/qr').then(res => res.blob()).then(res => {
            setQr(URL.createObjectURL(res));
            setLoading(false);
        })
    }

  return (
    <div className="App">
      <button onClick={() => {}}>Log In</button>
      {loading && 'Loading...'}
      {qr && <img src={qr} />}
    </div>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
