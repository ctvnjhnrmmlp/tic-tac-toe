'use server'

import Prisma from '@/database/database';
import { Result } from '@prisma/client';

export const addResult = async (result: Result) => {
	await Prisma.result.create({
		data: result,
	});
};
