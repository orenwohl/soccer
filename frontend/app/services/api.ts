/**
 * @deprecated This file is being refactored into individual service files.
 * Please import the services directly from their respective files or use the barrel export from 'app/services/index.ts'.
 *
 * Examples:
 * import { playerService } from '@/app/services'
 * import { matchService } from '@/app/services'
 * import { teamService } from '@/app/services'
 *
 * Or import specific services:
 * import { playerService } from '@/app/services/player.service'
 */

'use client'

import api from './api-client'
export { playerService } from './player.service'
export { matchService } from './match.service'
export { teamService } from './team.service'
export { authService } from './auth.service'
export { tableService } from './table.service'

export default api
