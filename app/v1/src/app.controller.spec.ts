import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service'; 
import { Database } from './database/database'; 
import { I18nContext } from 'nestjs-i18n';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService, 
        {
          provide: Database,
          useValue: {}, 
        },
      ],
    }).compile();

    appController = module.get<AppController>(AppController);
  });

  describe('getHello', () => {
    it('should return "Hello"', () => {
      const mockI18nContext = {
        t: jest.fn().mockResolvedValue('Hello'), 
      } as unknown as I18nContext;
      expect(appController.getHello(mockI18nContext));
    });
  });
});
