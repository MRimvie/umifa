import { Controller, Post } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

@Controller('migrate')
export class MigrateController {
  @Post()
  async migrate() {
    try {
      const { stdout, stderr } = await execAsync('./node_modules/.bin/prisma migrate deploy');
      
      return {
        success: true,
        message: 'Migrations exécutées avec succès',
        output: stdout,
        errors: stderr || null,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erreur lors de l\'exécution des migrations',
        error: error.message,
        output: error.stdout || null,
        stderr: error.stderr || null,
      };
    }
  }

  @Post('push')
  async push() {
    try {
      const { stdout, stderr } = await execAsync('./node_modules/.bin/prisma db push');
      
      return {
        success: true,
        message: 'Schema push réussi',
        output: stdout,
        errors: stderr || null,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erreur lors du push du schema',
        error: error.message,
        output: error.stdout || null,
        stderr: error.stderr || null,
      };
    }
  }
}
