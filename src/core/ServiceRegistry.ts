/**
 * @module ServiceRegistry
 * Центральное хранилище для всех Core сервисов проекта.
 */

type ServiceKey = string;
type ServiceInstance = any;

/**
 * Реализация ServiceRegistry в виде Singleton.
 */
class ServiceRegistry {
    private static instance: ServiceRegistry;
    private services: Record<ServiceKey, ServiceInstance>;

    /**
     * Конструктор класса.
     */
    private constructor() {
        this.services = {};
    }

    /**
     * Метод для получения единственного экземпляра ServiceRegistry.
     */
    public static getInstance(): ServiceRegistry {
        if (!ServiceRegistry.instance) {
            ServiceRegistry.instance = new ServiceRegistry();
        }
        return ServiceRegistry.instance;
    }

    /**
     * Регистрация сервиса.
     * @param key Уникальный ключ для сервиса.
     * @param service Экземпляр сервиса.
     */
    public register(key: ServiceKey, service: ServiceInstance): void {
        if (this.services[key]) {
            throw new Error(`Service with key "${key}" is already registered.`);
        }
        this.services[key] = service;
    }

    /**
     * Получение зарегистрированного сервиса.
     * @param key Уникальный ключ для сервиса.
     * @returns Экземпляр сервиса.
     */
    public get(key: ServiceKey): ServiceInstance {
        if (!this.services[key]) {
            throw new Error(`Service with key "${key}" is not registered.`);
        }
        return this.services[key];
    }

    /**
     * Проверка наличия сервиса.
     * @param key Уникальный ключ для сервиса.
     * @returns Зарегистрирован ли сервис.
     */
    public has(key: ServiceKey): boolean {
        return !!this.services[key];
    }
}

export default ServiceRegistry.getInstance();
