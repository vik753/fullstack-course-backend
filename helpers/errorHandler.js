export const setError = ({ res, error, code }) => {
  res.statusMessage = error;
  res.status(code).json({ error });
  return res;
};
