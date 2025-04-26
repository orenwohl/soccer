export { default as apiClient } from './api-client'
export { playerService } from './player.service'
export { matchService } from './match.service'
export { teamService } from './team.service'
export { authService } from './auth.service'
export { tableService } from './table.service'

// Re-export types
export type { StatisticsResponse } from './match.service'
export type { AuthResponse } from './auth.service'
