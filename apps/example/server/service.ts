export const getDataById = (id: string) =>
  Promise.resolve(`Data with id=${id}`);

export const getEmailFromCookie = (cookie?: string) =>
  cookie === 'VALID_COOKIE' ? 'EMAIL' : undefined;

export const getDataByEmail = (email: string) =>
  Promise.resolve({
    id: 'TEST_ID',
    name: `Name with email=${email}`,
  });

export const updateData = async (
  email: string,
  name: string
): Promise<void> => {
  console.log(`Updated ${name} with email=${email}`);
};
