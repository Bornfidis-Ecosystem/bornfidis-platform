'use server'

import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { UserRole } from '@prisma/client'

/**
 * Phase 2M — Admin: Create education module (CHEF).
 */
export async function createEducationModule(form: {
  title: string
  content: string
  required: boolean
}): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const module_ = await db.educationModule.create({
      data: {
        title: form.title.trim(),
        role: UserRole.CHEF,
        content: form.content.trim() || '',
        required: form.required,
      },
    })
    revalidatePath('/admin/education')
    revalidatePath('/chef/education')
    return { success: true, id: module_.id }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Failed to create module'
    return { success: false, error: message }
  }
}

/**
 * Phase 2M — Admin: Update education module.
 */
export async function updateEducationModule(
  id: string,
  form: { title: string; content: string; required: boolean }
): Promise<{ success: boolean; error?: string }> {
  try {
    await db.educationModule.update({
      where: { id },
      data: {
        title: form.title.trim(),
        content: form.content.trim() || '',
        required: form.required,
      },
    })
    revalidatePath('/admin/education')
    revalidatePath('/admin/education/[id]', 'page')
    revalidatePath('/chef/education')
    return { success: true }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Failed to update module'
    return { success: false, error: message }
  }
}
