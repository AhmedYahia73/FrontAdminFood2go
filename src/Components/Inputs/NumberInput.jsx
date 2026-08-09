// Components/NumberInput.jsx
// import React from 'react';

// const NumberInput = ({
//     value = '',
//     onChange,
//     placeholder,
//     backgound = 'white',
//     placeholderSize = false,
//     borderColor = "none",
//     paddinLeft = 'pl-2',
//     paddinRight = 'pr-2',
//     className = '',
//     ...props
// }) => {
//     const handleChange = (e) => {
//               const numericValue = e.target.value.replace(/[^0-9]/g, '');
//               e.target.value = numericValue;
//               onChange(e); // Pass the modified event to the parent's onChange handler
//     };

//     return (
//         <div className="w-full h-12">
//             <input
//                 type="text"
//                 inputMode="numeric"
//                 value={value}
//                 onChange={handleChange}
//                 className={`w-full border-2 rounded-2xl border-${borderColor}
//                     outline-none p-2 py-3 shadow ${paddinLeft} ${paddinRight}
//                     ${placeholderSize ? 'text-lg' : 'text-2xl'}
//                     font-TextFontRegular bg-${backgound} text-2xl text-thirdColor
//                     valueInput ${className}`}
//                 placeholder={placeholder}
//                 {...props}
//             />
//         </div>
//     );
// };

// export default NumberInput;


import React from 'react';

const NumberInput = ({
    value = '',
    onChange,
    placeholder,
    background = 'white', // Fixed spelling
    placeholderSize = false,
    borderColor = "none",
    paddingLeft = 'pl-2',  // Fixed spelling
    paddingRight = 'pr-2', // Fixed spelling
    className = '',
    allowNegative = false,
    ...props
}) => {

    const handleChange = (e) => {
        let val = e.target.value;

        if (allowNegative) {
            // Allow an optional leading minus, then digits and at most one dot
            // Strip everything that isn't a digit, dot, or a leading minus
            val = val.replace(/(?!^)-/g, '');        // remove minus signs that aren't at the start
            val = val.replace(/[^0-9.-]/g, '');      // remove anything else that isn't digit/dot/minus

            // Prevent multiple decimal points
            const parts = val.split('.');
            if (parts.length > 2) {
                val = parts[0] + '.' + parts.slice(1).join('');
            }
        } else {
            // 1. Remove any character that isn't a digit or a dot
            val = val.replace(/[^0-9.]/g, '');

            // 2. Prevent multiple decimal points (e.g., 1.2.3 becomes 1.23)
            const parts = val.split('.');
            if (parts.length > 2) {
                val = parts[0] + '.' + parts.slice(1).join('');
            }
        }

        // Create a fake event object to pass back to the parent
        const syntheticEvent = {
            ...e,
            target: {
                ...e.target,
                value: val,
            },
        };

        onChange(syntheticEvent);
    };

    return (
        <div className="w-full h-12">
            <input
                type="text"
                inputMode="decimal" // Optimized for mobile keyboards with decimals
                value={value}
                onChange={handleChange}
                className={`w-full border-2 rounded-2xl border-${borderColor}
                    outline-none p-2 py-3 shadow ${paddingLeft} ${paddingRight}
                    ${placeholderSize ? 'text-lg' : 'text-2xl'}
                    font-TextFontRegular bg-${background} text-2xl text-thirdColor
                    valueInput ${className}`}
                placeholder={placeholder}
                {...props}
            />
        </div>
    );
};

export default NumberInput;