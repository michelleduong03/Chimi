import React from 'react';

function VerticalNav({ selected, setSelected }) {
  return (
    <nav className="vertical-nav">
      <h2>Owner Menu</h2>
      {['orders', 'metrics', 'closeDay', 'logs'].map((item) => (
        <button
          key={item}
          className={selected === item ? 'nav-button active' : 'nav-button'}
          onClick={() => setSelected(item)}
        >
          {item[0].toUpperCase() + item.slice(1)}
        </button>
      ))}
    </nav>
  );
}

export default VerticalNav;
