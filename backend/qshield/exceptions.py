import logging
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status

logger = logging.getLogger('qshield.api')

def custom_exception_handler(exc, context):
    """
    Custom exception handler for Django REST Framework.
    Provides consistent error response structure across all API endpoints.
    """
    response = exception_handler(exc, context)

    view_name = context['view'].__class__.__name__ if 'view' in context else 'UnknownView'
    logger.error(f"API Exception in {view_name}: {str(exc)}", exc_info=True)

    if response is not None:
        custom_data = {
            'status': 'error',
            'status_code': response.status_code,
            'message': str(exc),
            'details': response.data
        }
        response.data = custom_data
    else:
        # Unhandled standard exceptions (e.g. ValueError, KeyError, QuantumSimErrors)
        response = Response(
            {
                'status': 'error',
                'status_code': status.HTTP_500_INTERNAL_SERVER_ERROR,
                'message': 'An internal error occurred in the Q-SHIELD backend.',
                'details': str(exc)
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    return response
