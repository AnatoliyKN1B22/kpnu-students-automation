import { test, expect } from '@testExtenter';
import { uiConst } from '@utils/constants/uiConst';
import { fakerDataGenerator } from '@utils/helpers/fakerGeneratedData';
import { CreateUserType } from 'src/types/userTypes';

test.describe.serial('Лабораторна робота №12: BDD (Behavior Driven Development) в Playwright', () => {
  let testUser: CreateUserType;

  test.beforeAll(async ({ browser }) => {
    // Підготовка тестового користувача для гарантованої незалежності від стороннього стану БД
    testUser = fakerDataGenerator.generateNewUserData();
    testUser.firstname = 'Anatoliy';
    testUser.lastname = 'Humelnyk';
    testUser.name = `${testUser.firstname} ${testUser.lastname}`;

    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto(`${process.env.BASE_URL || 'https://automationexercise.com'}/login`);

    // Заповнення форми старту реєстрації
    await page.locator('[data-qa="signup-name"]').fill(testUser.name);
    await page.locator('[data-qa="signup-email"]').fill(testUser.email);
    await page.locator('[data-qa="signup-button"]').click();

    // Заповнення обов'язкових полів профілю
    await page.locator('#id_gender1').check();
    await page.locator('#password').fill(testUser.password);
    await page.locator('#days').selectOption('15');
    await page.locator('#months').selectOption('6');
    await page.locator('#years').selectOption('1998');
    await page.locator('#first_name').fill(testUser.firstname);
    await page.locator('#last_name').fill(testUser.lastname);
    await page.locator('#address1').fill('Shevchenka St, 12');
    await page.locator('#country').selectOption('Canada');
    await page.locator('#state').fill('Ontario');
    await page.locator('#city').fill('Toronto');
    await page.locator('#zipcode').fill('M5V 2T6');
    await page.locator('#mobile_number').fill('+14165550199');
    await page.locator('[data-qa="create-account"]').click();

    await expect(page.locator('h2[data-qa="account-created"]')).toBeVisible();
    await page.locator('a[data-qa="continue-button"]').click();

    // Виходимо з акаунту для наступних тестів авторизації
    await page.locator('.shop-menu a', { hasText: 'Logout' }).click();
    await context.close();
  });

  test.afterAll(async ({ browser }) => {
    // Очищення: видалення створеного тестового користувача для підтримки чистоти БД
    try {
      const context = await browser.newContext();
      const page = await context.newPage();
      await page.goto(`${process.env.BASE_URL || 'https://automationexercise.com'}/login`);
      await page.locator('[data-qa="login-email"]').fill(testUser.email);
      await page.locator('[data-qa="login-password"]').fill(testUser.password);
      await page.locator('[data-qa="login-button"]').click();
      if (await page.locator('.shop-menu a', { hasText: 'Delete Account' }).isVisible()) {
        await page.locator('.shop-menu a', { hasText: 'Delete Account' }).click();
      }
      await context.close();
    } catch {
      // Ігноруємо помилки очищення, якщо акаунт вже видалено
    }
  });

  test.beforeEach(async ({ homePage }) => {
    await test.step('Given: Завантаження домашньої сторінки та ініціалізація тестового середовища', async () => {
      await homePage.load();
    });
  });

  test('BDD-01: Успішна авторизація зареєстрованого користувача з перевіркою UI-елементів та завершенням сесії (Logout)', async ({
    homePage,
    loginPage,
    headerComponent,
    navigarationComponent,
    page,
  }) => {
    await test.step('Given: Користувач має зареєстрований профіль та відкриває головну сторінку', async () => {
      await expect(page.locator('.logo img')).toBeVisible();
      await expect(page.locator('.shop-menu')).toBeVisible();
    });

    await test.step('When: Користувач переходить до форми авторизації "Signup / Login"', async () => {
      await homePage.clickOnMenuItem(uiConst.navigationMenu.SignUpOrLogin);
    });

    await test.step('Then: Відкривається сторінка авторизації /login з активними полями', async () => {
      await loginPage.verifyPageURL('/login');
      await expect(page.locator('[data-qa="login-email"]')).toBeVisible();
      await expect(page.locator('[data-qa="login-email"]')).toBeEnabled();
      await expect(page.locator('[data-qa="login-password"]')).toBeVisible();
      await expect(page.locator('[data-qa="login-password"]')).toBeEnabled();
      await expect(page.locator('[data-qa="login-button"]')).toBeEnabled();
    });

    await test.step('When: Користувач вводить валідні облікові дані та підтверджує вхід', async () => {
      await loginPage.fillAndSubmitLoginForm({
        email: testUser.email,
        password: testUser.password,
      });
    });

    await test.step('Then: Користувач успішно авторизований, у хедері відображається його ім\'я та кнопка Logout', async () => {
      await headerComponent.verifyLoggedInMessage(`Logged in as ${testUser.name}`);
      await expect(page.locator('.shop-menu')).toContainText('Logout');
      await expect(page.locator('.shop-menu')).toContainText('Delete Account');
    });

    await test.step('When: Користувач завершує сесію, натискаючи кнопку "Logout"', async () => {
      await navigarationComponent.clickOnMenuItem(uiConst.navigationMenu.Logout);
    });

    await test.step('Then: Сесія завершена, користувач перенаправлений на /login і знову доступна кнопка входу', async () => {
      await homePage.verifyPageURL('/login');
      await expect(page.locator('.shop-menu')).toContainText('Signup / Login');
      await expect(page.locator('.shop-menu')).not.toContainText('Logged in as');
    });
  });

  test('BDD-02: Відхилення авторизації з некоректним паролем та валідація банера помилки', async ({
    homePage,
    loginPage,
    page,
  }) => {
    const invalidCredentials = {
      email: testUser.email,
      password: 'IncorrectPassword_2026!',
    };

    await test.step('Given: Користувач відкриває сторінку автентифікації /login', async () => {
      await homePage.clickOnMenuItem(uiConst.navigationMenu.SignUpOrLogin);
      await loginPage.verifyPageURL('/login');
    });

    await test.step('When: Користувач вводить зареєстрований email та завідомо невірний пароль', async () => {
      await loginPage.fillAndSubmitLoginForm(invalidCredentials);
    });

    await test.step('Then: Система відхиляє авторизацію, залишає користувача на /login та відображає помилку', async () => {
      await loginPage.verifyInvalidCredentialsMessage();
      await expect(page.locator('.login-form p')).toContainText('Your email or password is incorrect!');
      await expect(page.locator('.login-form p')).toHaveCSS('color', 'rgb(255, 0, 0)');
      await expect(page).toHaveURL(/.*login/);
      await expect(page.locator('.shop-menu')).not.toContainText('Logged in as');
    });
  });

  test('BDD-03: Відхилення реєстрації нового користувача з уже зареєстрованим email', async ({
    homePage,
    loginPage,
    page,
  }) => {
    const duplicateUserData = {
      name: 'Anatoliy Humelnyk Duplicate',
      email: testUser.email, // Гарантовано зайнятий email, створений у beforeAll
    };

    await test.step('Given: Користувач перебуває на сторінці реєстрації /login', async () => {
      await homePage.clickOnMenuItem(uiConst.navigationMenu.SignUpOrLogin);
      await loginPage.verifyPageURL('/login');
      await expect(page.locator('.signup-form h2')).toHaveText('New User Signup!');
    });

    await test.step('When: Користувач намагається створити новий акаунт із зайнятим email', async () => {
      await loginPage.fillAndSubmitSignupForm(duplicateUserData);
    });

    await test.step('Then: Система блокує реєстрацію та виводить повідомлення "Email Address already exist!"', async () => {
      const errorMessage = page.locator('.signup-form p');
      await expect(errorMessage).toBeVisible();
      await expect(errorMessage).toHaveText('Email Address already exist!');
      await expect(errorMessage).toHaveCSS('color', 'rgb(255, 0, 0)');
      // При відправці форми URL стає /signup із заблокованим станом форми
      await expect(page).toHaveURL(/.*signup/);
    });
  });

  test('BDD-04: Навігація каталогом, фільтрація товарів за категорією та додавання до кошика', async ({
    homePage,
    caterogyProductsPage,
    addedToCardModal,
    page,
  }) => {
    await test.step('Given: Перевірка доступності панелі категорій на домашній сторінці', async () => {
      await expect(page.locator('#accordian')).toBeVisible();
    });

    await test.step('When: Покупець обирає категорію "Men" -> "Tshirts"', async () => {
      await homePage.selectCategory(uiConst.filters.GeneralCategories.Men, uiConst.filters.MenCategories.Tshirts);
    });

    await test.step('Then: Відкривається відповідна категорія товарів із коректним переліком карток', async () => {
      await caterogyProductsPage.verifyCategoryTitle(
        uiConst.filters.GeneralCategories.Men,
        uiConst.filters.MenCategories.Tshirts
      );
      await caterogyProductsPage.verifyNumberOfProductsDisplayed(6);
      await caterogyProductsPage.verifyProductNameAndDespription('Rs. 400', 'Men Tshirt');
    });

    await test.step('When: Покупець натискає "Add to cart" для першого знайденого товару', async () => {
      const firstProductAddToCartBtn = page
        .locator('.features_items .product-image-wrapper')
        .first()
        .locator('.productinfo a.add-to-cart');
      await firstProductAddToCartBtn.click();
    });

    await test.step('Then: Відображається модальне вікно підтвердження з кнопкою продовження покупок', async () => {
      await addedToCardModal.veridyModalIsVisible();
      await addedToCardModal.verifyAddedToCartMessage();
    });

    await test.step('When: Покупець натискає кнопку "Continue Shopping"', async () => {
      await addedToCardModal.clickOnContinueShoppingButton();
    });

    await test.step('Then: Модальне вікно закривається, а користувач залишається на сторінці категорії', async () => {
      await expect(page.locator('#cartModal')).not.toBeVisible();
      await expect(page.locator('h2.title')).toHaveText('Men - Tshirts Products');
    });
  });
});
