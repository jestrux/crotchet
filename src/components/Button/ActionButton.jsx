function ActionButton({
  type = "button",
  children,
  icon,
  color,
  onClick = () => {},
}) {
  return (
    <button
      type={type}
      className={`ActionButton ${color}
        bg-gray-100 hover:bg-gray-200 rounded-full w-7 h-7 flex items-center justify-center
        ${color == "light-warning" && "bg-yellow-100/60 text-yellow-800" }
        ${color == "light-success" && "bg-green-100/60 text-green-800" }
    `}
      onClick={onClick}
    >
      {icon ? icon : children}
    </button>
  );
}

export default ActionButton;
