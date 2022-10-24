export default {
  translation: {
    appName: 'Менджер задач',
    layout: {
      users: 'Пользователи',
      signIn: 'Вход',
      signUp: 'Регистрация',
      signOut: 'Выход',
    },
    flash: {
      authenticationError: 'Доступ запрещён! Пожалуйста, авторизируйтесь.',
      session: {
        success: 'Вы залогинены',
        delete: 'Вы разлогинены',
      },
      users: {
        error: 'Не удалось зарегистрировать',
        success: 'Пользователь успешно зарегистрирован',
        authorizationError: 'Вы не можете редактировать или удалять другого пользователя',
        delete: 'Пользователь успешно удалён',
        deleteError: 'Не удалось удалить пользователя',
        edit: 'Пользователь успешно изменён',
        editError: 'Не удалось изменить пользователя',
      },
    },
    views: {
      index: {
        header: 'Описание',
        content: 'Task Manager – система управления задачами, подобная http://www.redmine.org/. Она позволяет ставить задачи, назначать исполнителей и менять их статусы. Для работы с системой требуется регистрация и аутентификация.',
      },
      session: {
        new: {
          header: 'Регистрация',
          email: 'Email',
          password: 'Пароль',
          submit: 'Сохранить',
          error: 'Неправильный емейл или пароль',
        },
      },
      users: {
        new: {
          header: 'Регистрация',
          firstName: 'Имя',
          lastName: 'Фамилия',
          email: 'Email',
          password: 'Пароль',
          submit: 'Сохранить',
        },
        index: {
          header: 'Пользователи',
          id: 'ID',
          name: 'Полное имя',
          email: 'Email',
          createDate: 'Дата создания',
          actions: 'Действия',
          change: 'Изменить',
          delete: 'Удалить',
        },
        edit: {
          header: 'Изменение пользователя',
          firstName: 'Имя',
          lastName: 'Фамилия',
          email: 'Email',
          password: 'Пароль',
          submit: 'Изменить',
        },
      },
    },
  },
};
