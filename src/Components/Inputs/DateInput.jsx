// import classNames from 'classnames';

// const DateInput = ({ required = true, minDate = false, maxDate = false, borderColor = "none", value, onChange, placeholder }) => {
//   const currentDay = new Date();
//   const formattedDate = currentDay.toISOString().split('T')[0]; // Format as YYYY-MM-DD

//   return (
//     <input
//       type="date"
//       placeholder={placeholder}
//       className={classNames(
//         'w-full border-2 py-2 px-3 h-14 shadow rounded-xl outline-none text-2xl text-thirdColor',
//         {
//           'border-none': borderColor === 'none',
//           'border-mainColor': borderColor === 'mainColor',
//         }
//       )}
//       value={value}
//       onChange={onChange}
//       min={minDate === true ? formattedDate : minDate || ''} // Use minDate if provided, else current date if true, else no restriction
//       max={maxDate === true ? formattedDate : maxDate || ''} // Use maxDate if provided, else current date if true, else no restriction
//       required={required}
//     />
//   );
// };

// export default DateInput;

import classNames from 'classnames';

const DateInput = ({ required = true, minDate = false, maxDate = false, borderColor = "none", value, onChange, placeholder }) => {
  const currentDay = new Date();
  const formattedDate = currentDay.toISOString().split('T')[0]; // Format as YYYY-MM-DD

  return (
    <input
      type="date"
      placeholder={placeholder}
      className={classNames(
        'w-full border-2 py-2 px-3 h-14 shadow rounded-xl outline-none text-2xl text-thirdColor',
        {
          'border-none': borderColor === 'none',
          'border-mainColor': borderColor === 'mainColor',
        }
      )}
      value={value}
      onChange={onChange}
      min={minDate === true ? formattedDate : minDate || ''} // Use minDate if provided, else current date if true, else no restriction
      max={maxDate === true ? formattedDate : maxDate || ''} // Use maxDate if provided, else current date if true, else no restriction
      required={required}
    />
  );
};

export default DateInput;