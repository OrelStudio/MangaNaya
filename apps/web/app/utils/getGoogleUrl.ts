const getGoogleOAuthUrl = () => {
  const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth'

  const redirect_uri = process.env.GOOGLE_REDIRECT_URL
  const client_id = process.env.GOOGLE_CLIENT_ID

  if (!redirect_uri || !client_id) {
    throw new Error('Missing required environment variables')
  }

  const params = {
    redirect_uri,
    client_id,
    access_type: 'offline',
    response_type: 'code',
    prompt: 'consent',
    scope: [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile'
    ].join(' ')
  }

  const qs = new URLSearchParams(params).toString()

  return `${rootUrl}?${qs}`
}

export default getGoogleOAuthUrl