import { plainToInstance } from 'class-transformer';
import { IsString, validateSync } from 'class-validator';
import { config } from 'dotenv';
config({
  path: '.env',
});
class ConfigSchema {
  @IsString()
  DATABASE_URL: string;

  @IsString()
  ACCESS_TOKEN_SECRET: string;

  @IsString()
  REFRESH_TOKEN_SECRET: string;

  @IsString()
  REFRESH_TOKEN_EXPIRES_IN: string;
}

const configServer = plainToInstance(ConfigSchema, process.env, {
  enableImplicitConversion: true,
});
const e = validateSync(configServer);

if (e.length > 0) {
  const errors = e.map((error) => {
    return {
      property: error.property,
      constraints: error.constraints,
      value: error.value,
    };
  });

  throw new Error(`Config validation error: ${JSON.stringify(errors)}`);
}
