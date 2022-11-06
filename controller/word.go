package controller

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"pronunciation-corrector/common"
	"pronunciation-corrector/model"
	"strconv"
)

func GetWords(c *gin.Context) {
	offsetStr := c.DefaultQuery("offset", "0")
	limitStr := c.DefaultQuery("limit", "100")
	offset, err := strconv.Atoi(offsetStr)
	if err != nil || offset < 0 {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "无效的参数",
		})
		return
	}
	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit < 0 || limit > common.MaxWordsPerRequest {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "无效的参数",
		})
		return
	}
	words, err := model.GetWordsByOffsetAndLimit(offset, limit)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "",
		"data":    words,
	})
	return
}
