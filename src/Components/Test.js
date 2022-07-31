import { useParams } from "react-router-dom";

const Test = props => {
    const params = useParams();
    console.log(params)
    return(
        <div>test</div>
    )
};
export default Test;