import { Link } from "react-router-dom";

const Header = () => {
    return <header className="w-full border-b py-2 fixed">
        <div className=" mx-auto items-center px-1">
            <div className="flex gap-4 px-20">
                <Link to={"/"}>Home Page</Link>
                <Link to={"/about"}>About Page</Link>
            </div>
        </div>
    </header>
};

export default Header;