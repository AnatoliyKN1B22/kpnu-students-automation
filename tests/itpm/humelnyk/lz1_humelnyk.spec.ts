import { test, expect } from '@testExtenter';
import { uiConst } from '@utils/constants/uiConst';
import { fakerDataGenerator } from '@utils/helpers/fakerGeneratedData';

test.describe('Лабораторна робота №10. Управління IT-проєктом в Github', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.load();
  });

  test('Реєстрація нового користувача та верифікація імені в header', async ({
    homePage,
    loginPage,
    registrationPage,
    accountCreated,
    headerComponent,
    navigarationComponent,
    page,
  }) => {
    // 1. Генерація тестових даних відповідно до вимог лабораторної роботи
    const registrationData = fakerDataGenerator.generateNewUserData();
    registrationData.firstname = 'Anatoliy';
    registrationData.lastname = 'Humelnyk';
    registrationData.name = `${registrationData.firstname} ${registrationData.lastname}`;

    // 2. Action: Перехід з базової сторінки до форми реєстрації / авторизації
    await homePage.clickOnMenuItem(uiConst.navigationMenu.SignUpOrLogin);
    await loginPage.verifyPageURL('/login');

    // 3. Використання методів loginPage для старту реєстрації
    await loginPage.fillAndSubmitSignupForm({
      name: registrationData.name,
      email: registrationData.email,
    });

    // 4. Заповнення обов'язкових полів форми реєстрації
    await registrationPage.fillAndSubmitRegistrationForm(registrationData);

    // 5. Верифікація успішного створення акаунту та перехід далі
    await accountCreated.verifyAccountCreatedMessage();
    await accountCreated.clickOnContinueButton();

    // 6. Assertion: Перевірка наявності власного імені у верхній секції сторінки (header)
    await headerComponent.verifyLoggedInMessage(`Logged in as ${registrationData.name}`);
    await expect(page.locator('header')).toContainText(registrationData.firstname);

    // 7. Test Cleanup: Видалення створеного тестового акаунту для збереження консистентності БД
    await navigarationComponent.clickOnMenuItem(uiConst.navigationMenu.DeleteAccount);
  });
});
