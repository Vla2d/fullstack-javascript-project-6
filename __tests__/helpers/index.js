// eslint-disable-next-line import/prefer-default-export
export const getSessionCookie = async (app) => {
  await app.objection.knex('users').insert({ email: 'admin123@gmail.com', password_digest: 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3' });
  const response = await app.inject({
    method: 'POST',
    url: '/session',
    payload: {
      data: { email: 'admin123@gmail.com', password: '123' },
    },
  });
  // eslint-disable-next-line no-console
  console.log(response);
  return {};
};
