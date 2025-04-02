const InputBox = (props) => {
  return (
    <input
      className="round-edge primary-text-color primary-background-color std-padding"
      placeholder={props.placeholder}
      id={props.id}
      type={props.type}
      value={props.value}
      onChange={props.onChange}
    />
  );
};

export default InputBox;
