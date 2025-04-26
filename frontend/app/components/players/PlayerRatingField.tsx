import React from 'react'
import { EditableStarRating, RatingSvgIcons } from '@/app/services/svg.service'
import { PlayerRatingFieldProps } from './player.types'

/**
 * Component for a player rating field with icon and editable stars
 */
export const PlayerRatingField: React.FC<PlayerRatingFieldProps> = ({ field, value, onChange }) => {
	const fieldConfig = {
		fitnessRating: {
			icon: <RatingSvgIcons.fitness />,
			label: 'כושר'
		},
		defenseRating: {
			icon: <RatingSvgIcons.defense />,
			label: 'הגנה'
		},
		techniqueRating: {
			icon: <RatingSvgIcons.technique />,
			label: 'טכניקה'
		}
	}

	const { icon, label } = fieldConfig[field]

	return (
		<div className="mb-2">
			<label className="flex items-center text-gray-700 text-sm font-bold mb-2">
				{icon}
				<span className="mr-1">{label}</span>
			</label>
			<div className="flex items-center justify-end gap-1">
				<EditableStarRating value={value} onChange={newValue => onChange(field, newValue)} />
			</div>
		</div>
	)
}

export default PlayerRatingField
