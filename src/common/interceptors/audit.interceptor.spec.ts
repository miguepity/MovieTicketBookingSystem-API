import { ExecutionContext, CallHandler } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { of } from 'rxjs';
import { AuditInterceptor } from './audit.interceptor';
import { AUDITABLE_KEY } from '../decorators/auditable.decorator';

describe('AuditInterceptor', () => {
  const createLog = jest.fn().mockResolvedValue(undefined);
  const prisma = { auditLog: { create: createLog } } as any;
  const reflector = new Reflector();

  beforeEach(() => {
    createLog.mockClear();
    createLog.mockResolvedValue(undefined);
  });

  const ctx = (user: any, body: any, params: any, _meta: any): ExecutionContext => {
    const req = { user, body, params };
    return {
      switchToHttp: () => ({ getRequest: () => req }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as any;
  };

  function spyMeta(meta: any) {
    jest.spyOn(reflector, 'get').mockImplementation((key: any) =>
      key === AUDITABLE_KEY ? meta : undefined,
    );
  }

  it('writes audit_log on successful POST/PATCH/DELETE when handler is @Auditable', (done) => {
    spyMeta({ entidad: 'reservas', accion: 'actualizar' });
    const interceptor = new AuditInterceptor(prisma, reflector);
    const c = ctx({ userId: '7' }, { foo: 'bar' }, { id: '42' }, undefined);
    const next: CallHandler = { handle: () => of({ id: 42n, foo: 'bar' }) };

    interceptor.intercept(c, next).subscribe({
      next: () => {
        expect(createLog).toHaveBeenCalledWith(expect.objectContaining({
          data: expect.objectContaining({
            id_auditor: 7n,
            accion: 'actualizar',
            entidad: 'reservas',
            entidad_id: 42n,
          }),
        }));
        done();
      },
    });
  });

  it('skips when handler is not @Auditable', (done) => {
    spyMeta(undefined);
    const interceptor = new AuditInterceptor(prisma, reflector);
    const c = ctx({ userId: '1' }, {}, {}, undefined);
    const next: CallHandler = { handle: () => of('x') };
    interceptor.intercept(c, next).subscribe({
      next: () => {
        expect(createLog).not.toHaveBeenCalled();
        done();
      },
    });
  });

  it('falls back to req.params.id when response has no id', (done) => {
    spyMeta({ entidad: 'cines', accion: 'eliminar' });
    const interceptor = new AuditInterceptor(prisma, reflector);
    const c = ctx({ userId: '3' }, {}, { id: '99' }, undefined);
    const next: CallHandler = { handle: () => of({ deleted: true }) };

    interceptor.intercept(c, next).subscribe({
      next: () => {
        expect(createLog).toHaveBeenCalledWith(expect.objectContaining({
          data: expect.objectContaining({
            entidad_id: 99n,
          }),
        }));
        done();
      },
    });
  });

  it('stores null entidad_id when neither response.id nor params.id is available', (done) => {
    spyMeta({ entidad: 'peliculas', accion: 'accion' });
    const interceptor = new AuditInterceptor(prisma, reflector);
    const c = ctx({ userId: '5' }, {}, {}, undefined);
    const next: CallHandler = { handle: () => of({ ok: true }) };

    interceptor.intercept(c, next).subscribe({
      next: () => {
        expect(createLog).toHaveBeenCalledWith(expect.objectContaining({
          data: expect.objectContaining({
            entidad_id: null,
          }),
        }));
        done();
      },
    });
  });

  it('uses custom entidadId fn when provided', (done) => {
    spyMeta({
      entidad: 'funciones',
      accion: 'crear',
      entidadId: ({ res }: { req: any; res: any }) => res?.customId,
    });
    const interceptor = new AuditInterceptor(prisma, reflector);
    const c = ctx({ userId: '2' }, {}, {}, undefined);
    const next: CallHandler = { handle: () => of({ customId: 77n }) };

    interceptor.intercept(c, next).subscribe({
      next: () => {
        expect(createLog).toHaveBeenCalledWith(expect.objectContaining({
          data: expect.objectContaining({
            entidad_id: 77n,
          }),
        }));
        done();
      },
    });
  });
});
