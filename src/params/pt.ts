import type { ParamMatcher } from '@sveltejs/kit';
import { isProjectType } from '~/services/project/projectTypes';

export const match: ParamMatcher = isProjectType;
