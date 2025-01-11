import { useNavigate } from "react-router-dom"
import './Admin.css';

function Admin() {
    const navigate = useNavigate();

    const handleCourse = () => {
        navigate("/admin/course");
    };
    const handleReview = () => {
        navigate("/admin/review");
    };
    return (
        <>
            <div>
                <button onClick={() => {handleCourse();}}>Go to course management</button>
                <button onClick={() => {handleReview();}}>Go to review submissions</button>
            </div>
        </>
    )
}
export default Admin
