import images from "../images";
import "./HivemindLogo.css";

export function HivemindLogo() {
    return (
        <div className="logo">
            <img src={images.hivemind_logo} alt="HiveMind" />
        </div>
    );
}
