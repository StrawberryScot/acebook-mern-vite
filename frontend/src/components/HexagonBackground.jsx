import "./Hexagons.css";

const HexagonBackground = () => {
    const hexagons = [];
    let i = 0;
    for(let x = -1; x < 14; x++) {
    for(let y =-1; y < 16; y++) {
        const hexagon = <div className="hexagon-filled-light" style={{left: x * 9.4 + 'rem', top: y * 5.5 + 'rem'}} key={i}></div>;
        i++;
        const hexagon2 = <div className="hexagon-filled-light" style={{left: x * 9.4 + 4.7 + 'rem', top: y * 5.5 + 2.75 + 'rem'}} key={i}></div>;
        i++;
        hexagons.push(hexagon);
        hexagons.push(hexagon2);
        };
    };

    return (
        <>
            <div className="background-pattern-light"></div>
            {hexagons}
        </>
    );
}

export default HexagonBackground;