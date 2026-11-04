import React from 'react';
import Sidebar from './Components/Sidebar/Sidebar';
import Main from './Components/Main/Main';

const App = () => {
  return (
    <div className="app">
  
      <div className="gemini-container">
        <Sidebar />
        <Main />
      </div>
    </div>
  );
};

export default App;
