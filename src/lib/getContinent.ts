import { USER_LOCATION } from '.'

export const getContinent = (): string | undefined => {
  const continent = localStorage.getItem(USER_LOCATION)
  return continent ? JSON.parse(continent) : undefined
}
