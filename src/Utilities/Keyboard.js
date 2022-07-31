
let key = null;

const onKeyDown = e => {
    // console.log(e);
    if(key == null){
        key = e.key;
    }
};

const onKeyUp = e => {
    key = null;
};

const getKey = () => key;

export { getKey, onKeyDown, onKeyUp };