const SubmitButton = ({
       width = "w-full",
       text,
       disabledBgColor = "bg-gray-400",
       bgColor = "bg-mainColor",
       Color = "text-white",
       Size = "text-2xl",
       px = "px-7",
       rounded = "rounded-xl",
       disabled = false,
}) => {
       return (
              <button
                     type="submit"
                     disabled={disabled}
                     className={`${disabled ? `${disabledBgColor} cursor-not-allowed` : bgColor} ${width} ${Color} ${Size} font-TextFontRegular ${rounded} pt-2 py-3 ${px}`}
              >
                     {text}
              </button>
       );
};

export default SubmitButton;

// Components/SubmitButton.jsx
// const SubmitButton = ({
//        width = "w-full",
//        text,
//        disabledBgColor = "bg-gray-400",
//        bgColor = "bg-mainColor",
//        Color = "text-white",
//        Size = "text-2xl",
//        px = "px-7",
//        rounded = "rounded-xl",
//        disabled = false,
//        handleClick,
// }) => {
//        return (
//               <button
//                      type="button"                    // ← THIS IS THE FIX
//                      onClick={handleClick}
//                      disabled={disabled}
//                      className={`
//                 ${disabled ? disabledBgColor + " cursor-not-allowed" : bgColor + " hover:opacity-90"}
//                 ${width} ${Color} ${Size} font-TextFontRegular ${rounded} py-3 ${px} transition-all
//             `}
//               >
//                      {text}
//               </button>
//        );
// };

// export default SubmitButton;