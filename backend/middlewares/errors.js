export default function Errors(err, req, res, next) {
  console.log('[ERROR]', err);
  res.redirect('/');
}