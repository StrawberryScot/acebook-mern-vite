import "./ThemeToggle.css";

const ThemeToggle = () => {
    return (
        <label className="switch">
            <input className="theme-toggle" type="checkbox"></input>
            <span className="slider round"></span>
        </label>
    );
};

export default ThemeToggle;