const getLogoutUrl = () => {
  const baseUrl = process.env.API_URL
  return `${baseUrl}/logout`
}

export default getLogoutUrl