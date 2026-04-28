import { Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

@ApiTags('migrate')
@Controller('migrate')
export class MigrateController {
  @Post()
  @ApiOperation({ summary: 'Lancer prisma migrate deploy' })
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
  @ApiOperation({ summary: 'Appliquer le schéma Prisma (db push) — ajoute les colonnes manquantes' })
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

  @Post('reset')
  @ApiOperation({ summary: '⚠️ Réinitialiser la base de données (PERTE DE DONNÉES)' })
  async reset() {
    try {
      const { stdout, stderr } = await execAsync('./node_modules/.bin/prisma db push --force-reset --accept-data-loss');
      
      return {
        success: true,
        message: 'Base de données réinitialisée et schema créé',
        output: stdout,
        errors: stderr || null,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erreur lors de la réinitialisation',
        error: error.message,
        output: error.stdout || null,
        stderr: error.stderr || null,
      };
    }
  }
}
