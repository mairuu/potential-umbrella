export type ProjectType = (typeof projectTypes)[number];

export const projectTypes = ['manga', 'novel'] as const;

export function isProjectType(value?: string): value is ProjectType {
	return !!value && projectTypes.includes(value as ProjectType);
}
