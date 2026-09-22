const ErrorMessage = ({ message = "Something went wrong." }) => {
  return (
    <p role="alert" className="text-sm text-red-700">
      {message}
    </p>
  );
};

export default ErrorMessage;
