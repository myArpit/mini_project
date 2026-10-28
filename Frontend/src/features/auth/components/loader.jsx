import React from 'react';
// import '../../../style/loder.scss'; // adjust path as needed
import "../../../style/loader.scss"


const Loader = ({ message = "Loading..." }) => {
  return (
    <main className="loader-container">
      <div className="spinner"></div>
      <p>{message}</p>
    </main>
  );
};

export default Loader;