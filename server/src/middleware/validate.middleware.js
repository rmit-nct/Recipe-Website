// Parses one part of the request with a Zod schema BEFORE the controller runs
// (CLAUDE.md §9 — "parse, don't validate"). The cleaned object lands on
// `req.validated`, so controllers never touch raw `req.body` / `req.query`.
//
// `req.validated` rather than reassigning `req.query`: in Express 5 `req.query`
// is a getter with no setter, so assigning to it throws under ESM strict mode.
const validate = (schema, source) => (req, res, next) => {
  const result = schema.safeParse(req[source]);

  if (!result.success) {
    const firstIssue = result.error.issues[0];
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: firstIssue
          ? `${firstIssue.path.join('.') || source}: ${firstIssue.message}`
          : 'Invalid input data',
      },
    });
  }

  req.validated = result.data;
  return next();
};

export const validateBody = (schema) => validate(schema, 'body');
export const validateQuery = (schema) => validate(schema, 'query');
