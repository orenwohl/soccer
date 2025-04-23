import configProd from './prod'
import configDev from './dev'

export let config: any

if (process.env.NODE_ENV === 'production') {
	config = configProd
} else {
	config = configDev
}
