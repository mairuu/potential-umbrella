import type { ParamMatcher } from '@sveltejs/kit';
import { isProjectType } from '~/domain/project/ProjectType';

export const match: ParamMatcher = isProjectType;
