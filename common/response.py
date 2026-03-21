from rest_framework.response import Response

def success_response(message='', data= None, status=200):
    return Response({
        "success": True,
        "massage": message,
        "data": data
    }, status=status)


def error_response(message='', errors= None, status=400):
    return Response({
        "success": False,
        "massage": message,
        "errors": errors
    }, status=status)